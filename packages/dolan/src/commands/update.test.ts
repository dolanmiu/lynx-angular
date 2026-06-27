import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { readdirSync } from 'node:fs';
import { createFixture, DEFAULT_CONFIG, type Fixture } from '../test-utils';
import { hashContent } from '../lockfile';

const spinnerMock = { start: vi.fn(), stop: vi.fn() };

vi.mock('@clack/prompts', () => ({
  intro: vi.fn(),
  outro: vi.fn(),
  log: {
    message: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
  spinner: vi.fn(() => spinnerMock),
  confirm: vi.fn().mockResolvedValue(true),
  select: vi.fn().mockResolvedValue('upstream'),
  cancel: vi.fn(),
  isCancel: vi.fn().mockReturnValue(false),
}));

let fixture: Fixture;

vi.mock('../utils/resolve-paths.js', () => ({
  getUiSourceDir: () => fixture.uiDir,
  getComponentSourceDir: (name: string) =>
    join(fixture.uiDir, 'components', name),
  getComponentFiles: (name: string) =>
    readdirSync(join(fixture.uiDir, 'components', name)).filter((f) =>
      f.endsWith('.ts'),
    ),
  rewriteImports: (content: string) => content,
}));

beforeEach(() => {
  vi.spyOn(process, 'exit').mockImplementation((code) => {
    throw new Error(`process.exit(${code})`);
  });
});

afterEach(() => {
  fixture?.cleanup();
  vi.restoreAllMocks();
});

const readLockfile = (dir: string) =>
  JSON.parse(readFileSync(join(dir, 'dolan.lock.json'), 'utf-8'));

const readInstalledFile = (dir: string, component: string, file: string) =>
  readFileSync(
    join(dir, DEFAULT_CONFIG.aliases.components, component, file),
    'utf-8',
  );

describe('updateCommand --selective', () => {
  it('applies file when user chooses upstream', async () => {
    const original = 'export const Card = { v: 1 };';
    const upstream = 'export const Card = { v: 2 };';
    fixture = createFixture({
      config: DEFAULT_CONFIG,
      lockfile: {
        version: 1,
        components: { card: { 'card.ts': { hash: hashContent(original) } } },
        utils: {},
        theme: {},
      },
      components: { card: { 'card.ts': original } },
      uiSource: { card: { 'card.ts': upstream } },
    });

    vi.spyOn(process, 'cwd').mockReturnValue(fixture.dir);

    const p = await import('@clack/prompts');
    (p.select as ReturnType<typeof vi.fn>).mockResolvedValue('upstream');

    const { updateCommand } = await import('./update');
    await updateCommand({ selective: true });

    const content = readInstalledFile(fixture.dir, 'card', 'card.ts');
    expect(content).toBe(upstream);

    const lockfile = readLockfile(fixture.dir);
    expect(lockfile.components.card['card.ts'].hash).toBe(
      hashContent(upstream),
    );
  });

  it('skips file and preserves lockfile hash when user chooses keep', async () => {
    const original = 'export const Card = { v: 1 };';
    const upstream = 'export const Card = { v: 2 };';
    const originalHash = hashContent(original);
    fixture = createFixture({
      config: DEFAULT_CONFIG,
      lockfile: {
        version: 1,
        components: { card: { 'card.ts': { hash: originalHash } } },
        utils: {},
        theme: {},
      },
      components: { card: { 'card.ts': original } },
      uiSource: { card: { 'card.ts': upstream } },
    });

    vi.spyOn(process, 'cwd').mockReturnValue(fixture.dir);

    const p = await import('@clack/prompts');
    (p.select as ReturnType<typeof vi.fn>).mockResolvedValue('keep');

    const { updateCommand } = await import('./update');
    await updateCommand({ selective: true });

    const content = readInstalledFile(fixture.dir, 'card', 'card.ts');
    expect(content).toBe(original);

    const lockfile = readLockfile(fixture.dir);
    expect(lockfile.components.card['card.ts'].hash).toBe(originalHash);
  });

  it('handles mixed decisions across multiple files', async () => {
    const cardOriginal = 'export const Card = { v: 1 };';
    const cardUpstream = 'export const Card = { v: 2 };';
    const spinnerOriginal = 'export const Spinner = { v: 1 };';
    const spinnerUpstream = 'export const Spinner = { v: 2 };';
    const cardHash = hashContent(cardOriginal);
    const spinnerHash = hashContent(spinnerOriginal);

    fixture = createFixture({
      config: DEFAULT_CONFIG,
      lockfile: {
        version: 1,
        components: {
          card: { 'card.ts': { hash: cardHash } },
          spinner: { 'spinner.ts': { hash: spinnerHash } },
        },
        utils: {},
        theme: {},
      },
      components: {
        card: { 'card.ts': cardOriginal },
        spinner: { 'spinner.ts': spinnerOriginal },
      },
      uiSource: {
        card: { 'card.ts': cardUpstream },
        spinner: { 'spinner.ts': spinnerUpstream },
      },
    });

    vi.spyOn(process, 'cwd').mockReturnValue(fixture.dir);

    const p = await import('@clack/prompts');
    (p.select as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce('upstream')
      .mockResolvedValueOnce('keep');

    const { updateCommand } = await import('./update');
    await updateCommand({ selective: true });

    // Card should be updated (first select → upstream)
    expect(readInstalledFile(fixture.dir, 'card', 'card.ts')).toBe(
      cardUpstream,
    );

    // Spinner should be skipped (second select → keep)
    expect(readInstalledFile(fixture.dir, 'spinner', 'spinner.ts')).toBe(
      spinnerOriginal,
    );

    const lockfile = readLockfile(fixture.dir);
    expect(lockfile.components.card['card.ts'].hash).toBe(
      hashContent(cardUpstream),
    );
    expect(lockfile.components.spinner['spinner.ts'].hash).toBe(spinnerHash);
  });

  it('does not create new-upstream file when user chooses skip', async () => {
    const upstream = 'export const Card = {};';
    fixture = createFixture({
      config: DEFAULT_CONFIG,
      lockfile: {
        version: 1,
        components: {},
        utils: {},
        theme: {},
      },
      components: { card: {} },
      uiSource: { card: { 'card.ts': upstream } },
    });

    vi.spyOn(process, 'cwd').mockReturnValue(fixture.dir);

    const p = await import('@clack/prompts');
    (p.select as ReturnType<typeof vi.fn>).mockResolvedValue('keep');

    const { updateCommand } = await import('./update');
    await updateCommand({ selective: true });

    const filePath = join(
      fixture.dir,
      DEFAULT_CONFIG.aliases.components,
      'card',
      'card.ts',
    );
    expect(existsSync(filePath)).toBe(false);

    const lockfile = readLockfile(fixture.dir);
    expect(lockfile.components.card?.['card.ts']).toBeUndefined();
  });

  it('force overrides selective — no per-file prompts', async () => {
    const original = 'export const Card = { v: 1 };';
    const upstream = 'export const Card = { v: 2 };';
    fixture = createFixture({
      config: DEFAULT_CONFIG,
      lockfile: {
        version: 1,
        components: { card: { 'card.ts': { hash: hashContent(original) } } },
        utils: {},
        theme: {},
      },
      components: { card: { 'card.ts': original } },
      uiSource: { card: { 'card.ts': upstream } },
    });

    vi.spyOn(process, 'cwd').mockReturnValue(fixture.dir);

    const p = await import('@clack/prompts');
    (p.select as ReturnType<typeof vi.fn>).mockClear();

    const { updateCommand } = await import('./update');
    await updateCommand({ force: true, selective: true });

    expect(readInstalledFile(fixture.dir, 'card', 'card.ts')).toBe(upstream);
    expect(p.select).not.toHaveBeenCalled();
  });

  it('conflict-keep still advances lockfile hash in selective mode', async () => {
    const base = 'export const Card = { v: 1 };';
    const userVersion = 'export const Card = { v: 1, custom: true };';
    const upstream = 'export const Card = { v: 2 };';
    const baseHash = hashContent(base);

    fixture = createFixture({
      config: DEFAULT_CONFIG,
      lockfile: {
        version: 1,
        components: { card: { 'card.ts': { hash: baseHash } } },
        utils: {},
        theme: {},
      },
      components: { card: { 'card.ts': userVersion } },
      uiSource: { card: { 'card.ts': upstream } },
    });

    vi.spyOn(process, 'cwd').mockReturnValue(fixture.dir);

    const p = await import('@clack/prompts');
    (p.select as ReturnType<typeof vi.fn>).mockResolvedValue('keep');

    const { updateCommand } = await import('./update');
    await updateCommand({ selective: true });

    // File should be untouched
    expect(readInstalledFile(fixture.dir, 'card', 'card.ts')).toBe(userVersion);

    // Lockfile hash should be advanced to upstream (conflict-keep semantics)
    const lockfile = readLockfile(fixture.dir);
    expect(lockfile.components.card['card.ts'].hash).toBe(
      hashContent(upstream),
    );
  });

  it('non-selective mode uses batch confirm, not per-file select', async () => {
    const original = 'export const Card = { v: 1 };';
    const upstream = 'export const Card = { v: 2 };';
    fixture = createFixture({
      config: DEFAULT_CONFIG,
      lockfile: {
        version: 1,
        components: { card: { 'card.ts': { hash: hashContent(original) } } },
        utils: {},
        theme: {},
      },
      components: { card: { 'card.ts': original } },
      uiSource: { card: { 'card.ts': upstream } },
    });

    vi.spyOn(process, 'cwd').mockReturnValue(fixture.dir);

    const p = await import('@clack/prompts');
    (p.confirm as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    (p.select as ReturnType<typeof vi.fn>).mockClear();

    const { updateCommand } = await import('./update');
    await updateCommand({});

    expect(p.confirm).toHaveBeenCalled();
    expect(p.select).not.toHaveBeenCalled();
    expect(readInstalledFile(fixture.dir, 'card', 'card.ts')).toBe(upstream);
  });

  it('shows selective-mode skip message in final summary', async () => {
    const original = 'export const Card = { v: 1 };';
    const upstream = 'export const Card = { v: 2 };';
    fixture = createFixture({
      config: DEFAULT_CONFIG,
      lockfile: {
        version: 1,
        components: { card: { 'card.ts': { hash: hashContent(original) } } },
        utils: {},
        theme: {},
      },
      components: { card: { 'card.ts': original } },
      uiSource: { card: { 'card.ts': upstream } },
    });

    vi.spyOn(process, 'cwd').mockReturnValue(fixture.dir);

    const p = await import('@clack/prompts');
    (p.select as ReturnType<typeof vi.fn>).mockResolvedValue('keep');

    const { updateCommand } = await import('./update');
    await updateCommand({ selective: true });

    expect(p.log.info).toHaveBeenCalledWith(
      expect.stringContaining("they'll appear again on next update"),
    );
  });

  it('user-modified files can be reverted to upstream in selective mode', async () => {
    const upstream = 'export const Card = { v: 2 };';
    const userVersion = 'export const Card = { v: 2, custom: true };';
    // Lockfile hash matches upstream — simulates a previous conflict-keep
    // where the base was advanced but the user's file differs
    fixture = createFixture({
      config: DEFAULT_CONFIG,
      lockfile: {
        version: 1,
        components: {
          card: { 'card.ts': { hash: hashContent(upstream) } },
        },
        utils: {},
        theme: {},
      },
      components: { card: { 'card.ts': userVersion } },
      uiSource: { card: { 'card.ts': upstream } },
    });

    vi.spyOn(process, 'cwd').mockReturnValue(fixture.dir);

    const p = await import('@clack/prompts');
    (p.select as ReturnType<typeof vi.fn>).mockResolvedValue('upstream');

    const { updateCommand } = await import('./update');
    await updateCommand({ selective: true });

    // File should be reverted to upstream
    const content = readInstalledFile(fixture.dir, 'card', 'card.ts');
    expect(content).toBe(upstream);

    const lockfile = readLockfile(fixture.dir);
    expect(lockfile.components.card['card.ts'].hash).toBe(
      hashContent(upstream),
    );
  });
});

/**
 * Multi-line content with two separate change regions (hunks) separated
 * by enough unchanged lines that structuredPatch produces 2 distinct hunks.
 */
const makeMultiHunkContent = () => {
  const lines = (changes: [number, string][]) => {
    const base = Array.from({ length: 20 }, (_, i) => `line ${i + 1}`);
    for (const [idx, value] of changes) {
      base[idx] = value;
    }
    return base.join('\n') + '\n';
  };

  return {
    original: lines([]),
    upstream: lines([
      [1, 'CHANGED line 2'],
      [18, 'CHANGED line 19'],
    ]),
  };
};

describe('updateCommand --selective hunk review', () => {
  it('partially applies only accepted hunks', async () => {
    const { original, upstream } = makeMultiHunkContent();
    fixture = createFixture({
      config: DEFAULT_CONFIG,
      lockfile: {
        version: 1,
        components: { card: { 'card.ts': { hash: hashContent(original) } } },
        utils: {},
        theme: {},
      },
      components: { card: { 'card.ts': original } },
      uiSource: { card: { 'card.ts': upstream } },
    });

    vi.spyOn(process, 'cwd').mockReturnValue(fixture.dir);

    const p = await import('@clack/prompts');
    (p.select as ReturnType<typeof vi.fn>)
      // File-level prompt → choose hunk review
      .mockResolvedValueOnce('hunk-review')
      // Hunk 1 → accept
      .mockResolvedValueOnce('accept')
      // Hunk 2 → reject
      .mockResolvedValueOnce('reject');

    const { updateCommand } = await import('./update');
    await updateCommand({ selective: true });

    const content = readInstalledFile(fixture.dir, 'card', 'card.ts');
    // First hunk accepted: line 2 should be changed
    expect(content).toContain('CHANGED line 2');
    // Second hunk rejected: line 19 should be original
    expect(content).toContain('line 19');
    expect(content).not.toContain('CHANGED line 19');

    // Lockfile should be advanced to upstream hash
    const lockfile = readLockfile(fixture.dir);
    expect(lockfile.components.card['card.ts'].hash).toBe(
      hashContent(upstream),
    );
  });

  it('treats all hunks accepted as full upstream apply', async () => {
    const { original, upstream } = makeMultiHunkContent();
    fixture = createFixture({
      config: DEFAULT_CONFIG,
      lockfile: {
        version: 1,
        components: { card: { 'card.ts': { hash: hashContent(original) } } },
        utils: {},
        theme: {},
      },
      components: { card: { 'card.ts': original } },
      uiSource: { card: { 'card.ts': upstream } },
    });

    vi.spyOn(process, 'cwd').mockReturnValue(fixture.dir);

    const p = await import('@clack/prompts');
    (p.select as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce('hunk-review')
      .mockResolvedValueOnce('accept')
      .mockResolvedValueOnce('accept');

    const { updateCommand } = await import('./update');
    await updateCommand({ selective: true });

    const content = readInstalledFile(fixture.dir, 'card', 'card.ts');
    expect(content).toBe(upstream);
  });

  it('treats all hunks rejected as keep', async () => {
    const { original, upstream } = makeMultiHunkContent();
    const originalHash = hashContent(original);
    fixture = createFixture({
      config: DEFAULT_CONFIG,
      lockfile: {
        version: 1,
        components: { card: { 'card.ts': { hash: originalHash } } },
        utils: {},
        theme: {},
      },
      components: { card: { 'card.ts': original } },
      uiSource: { card: { 'card.ts': upstream } },
    });

    vi.spyOn(process, 'cwd').mockReturnValue(fixture.dir);

    const p = await import('@clack/prompts');
    (p.select as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce('hunk-review')
      .mockResolvedValueOnce('reject')
      .mockResolvedValueOnce('reject');

    const { updateCommand } = await import('./update');
    await updateCommand({ selective: true });

    const content = readInstalledFile(fixture.dir, 'card', 'card.ts');
    expect(content).toBe(original);

    // Lockfile should be preserved (selective skip semantics)
    const lockfile = readLockfile(fixture.dir);
    expect(lockfile.components.card['card.ts'].hash).toBe(originalHash);
  });
});

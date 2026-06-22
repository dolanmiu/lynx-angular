import * as p from '@clack/prompts';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
} from 'node:fs';
import { resolve, join } from 'node:path';
import pc from 'picocolors';
import { configExists, readConfig } from '../config.js';
import { getComponentNames } from '../registry.js';
import {
  getComponentFiles,
  getComponentSourceDir,
  getUiSourceDir,
  rewriteImports,
} from '../utils/resolve-paths.js';
import {
  getOrCreateLockfile,
  hashContent,
  writeLockfile,
  type Lockfile,
} from '../lockfile.js';
import {
  analyzeFile,
  formatDiff,
  summarizeComponent,
  STATUS_ICONS,
  STATUS_LABELS,
  type FileAnalysis,
  type ComponentAnalysis,
} from '../utils/analyze.js';

/**
 * Interactively presents a three-way merge conflict (user has edits + upstream
 * has changes) and asks the user to resolve it. The "Show diff" option loops
 * back into the same prompt so the user can inspect before committing — only
 * "keep mine" or "take upstream" finalizes.
 */
const resolveConflict = async (
  componentName: string,
  analysis: FileAnalysis,
): Promise<'keep' | 'upstream'> => {
  // Infinite loop so the user can view the diff and then choose. "Show diff"
  // loops back to the same prompt rather than terminating — the loop only
  // exits when the user picks a final action (keep or upstream).
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const choice = await p.select({
      message: `${pc.bold(componentName)}/${pc.bold(analysis.file)} — how to resolve?`,
      options: [
        {
          value: 'diff',
          label: 'Show diff',
          hint: 'see what changed',
        },
        {
          value: 'keep',
          label: 'Keep my version',
          hint: 'skip upstream changes for this file',
        },
        {
          value: 'upstream',
          label: 'Take upstream version',
          hint: 'discard my changes for this file',
        },
      ],
    });

    if (p.isCancel(choice)) {
      p.cancel('Upgrade cancelled.');
      process.exit(0);
    }

    if (choice === 'diff') {
      const diff = formatDiff(analysis.currentContent, analysis.newContent);
      p.log.message(
        `\n${pc.bold('Diff')} (${pc.red('- yours')} / ${pc.green('+ upstream')}):\n\n${diff}\n`,
      );
      continue;
    }

    return choice as 'keep' | 'upstream';
  }
};

/**
 * Three-way merge upgrade for installed components, modeled on the same flow
 * git/Mercurial use when applying upstream changes to a fork:
 *
 *   - **base** (lockfile hash) — what the file was at last add/upgrade.
 *   - **current** (disk content) — what the user has now.
 *   - **upstream** (registry source, re-rewritten) — what we'd install fresh.
 *
 * For each file, `analyzeFile` produces a status:
 *   - **up-to-date**       — base == current == upstream (no work needed).
 *   - **auto-upgrade**     — current matches base, upstream differs (safe to
 *                            overwrite — user hasn't touched the file).
 *   - **new-upstream**     — file didn't exist locally (new dependency file).
 *   - **user-modified**    — current differs from base, upstream matches base
 *                            (user has edits, no upstream change → keep theirs).
 *   - **conflict**         — current differs from base AND upstream differs
 *                            from base (both sides moved → prompt the user).
 *
 * `--force` bypasses all prompts and overwrites every file with upstream,
 * which is destructive but useful for resetting to a clean baseline.
 *
 * After the apply phase, the lockfile is updated to record the new upstream
 * hash for every file — even ones the user chose to keep. This intentionally
 * "advances the base" so the user only sees the same conflict once: next
 * upgrade compares against the (now-advanced) base and surfaces only changes
 * introduced since this upgrade.
 */
export const upgradeCommand = async (options: { force?: boolean }) => {
  const cwd = process.cwd();

  p.intro(pc.bold('dolan upgrade'));

  if (!configExists(cwd)) {
    p.log.error(
      `No ${pc.cyan('dolan.config.json')} found. Run ${pc.bold('dolan init')} first.`,
    );
    process.exit(1);
  }

  const config = readConfig(cwd);
  const componentsDir = resolve(cwd, config.aliases.components);

  if (!existsSync(componentsDir)) {
    p.log.warn('No components directory found. Nothing to upgrade.');
    p.outro('Done.');
    return;
  }

  const allKnown = new Set(getComponentNames());
  const installed = readdirSync(componentsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && allKnown.has(entry.name))
    .map((entry) => entry.name)
    .sort();

  if (installed.length === 0) {
    p.log.warn('No installed components found. Nothing to upgrade.');
    p.outro('Done.');
    return;
  }

  const lockfile = getOrCreateLockfile(cwd);

  // --- Analysis phase ---
  const s = p.spinner();
  s.start('Analyzing changes...');

  const componentAnalyses: ComponentAnalysis[] = [];

  for (const name of installed) {
    const destDir = resolve(componentsDir, name);
    const files = getComponentFiles(name);
    const lockedComponent = lockfile.components[name] ?? {};

    const fileAnalyses: FileAnalysis[] = [];

    for (const file of files) {
      const srcContent = readFileSync(
        join(getComponentSourceDir(name), file),
        'utf-8',
      );
      const newContent = rewriteImports(srcContent);
      const destPath = join(destDir, file);

      const currentContent = existsSync(destPath)
        ? readFileSync(destPath, 'utf-8')
        : null;

      const storedHash = lockedComponent[file]?.hash ?? null;
      const status = analyzeFile(
        currentContent,
        newContent,
        storedHash,
        hashContent,
      );

      fileAnalyses.push({
        file,
        status,
        currentContent: currentContent ?? '',
        newContent,
      });
    }

    componentAnalyses.push({ name, files: fileAnalyses });
  }

  // Analyze shared files (theme only — utils now come from @blotch/dolan)
  const uiSrc = getUiSourceDir();
  const sharedAnalyses: FileAnalysis[] = [];

  // Theme files
  const themeDir = resolve(cwd, config.aliases.theme);
  const themeFiles = ['default.css', 'dark.css', 'tailwind-plugin.ts'];
  for (const file of themeFiles) {
    const src = join(uiSrc, 'theme', file);
    if (!existsSync(src)) continue;

    const newContent = readFileSync(src, 'utf-8');
    const destPath = join(themeDir, file);
    const currentContent = existsSync(destPath)
      ? readFileSync(destPath, 'utf-8')
      : null;
    const storedHash = lockfile.theme[file]?.hash ?? null;

    sharedAnalyses.push({
      file: `theme/${file}`,
      status: analyzeFile(currentContent, newContent, storedHash, hashContent),
      currentContent: currentContent ?? '',
      newContent,
    });
  }

  s.stop('Analysis complete.');

  // --- Display summary ---
  p.log.message(pc.bold('\nComponents:'));

  for (const comp of componentAnalyses) {
    const overall = summarizeComponent(comp);
    p.log.message(
      `  ${STATUS_ICONS[overall]} ${pc.bold(comp.name)} — ${STATUS_LABELS[overall]}`,
    );
  }

  if (sharedAnalyses.length > 0) {
    p.log.message(pc.bold('\nShared files:'));
    for (const file of sharedAnalyses) {
      p.log.message(
        `  ${STATUS_ICONS[file.status]} ${pc.bold(file.file)} — ${STATUS_LABELS[file.status]}`,
      );
    }
  }

  // Compute stats
  const allFiles = [
    ...componentAnalyses.flatMap((c) => c.files),
    ...sharedAnalyses,
  ];
  const autoUpgradeCount = allFiles.filter(
    (f) => f.status === 'auto-upgrade' || f.status === 'new-upstream',
  ).length;
  const userModifiedCount = allFiles.filter(
    (f) => f.status === 'user-modified',
  ).length;
  const conflictCount = allFiles.filter((f) => f.status === 'conflict').length;
  const upToDateCount = allFiles.filter(
    (f) => f.status === 'up-to-date',
  ).length;

  p.log.message('');
  p.log.info(
    [
      upToDateCount > 0 ? `${pc.green(String(upToDateCount))} up to date` : '',
      autoUpgradeCount > 0
        ? `${pc.blue(String(autoUpgradeCount))} auto-upgrade`
        : '',
      userModifiedCount > 0
        ? `${pc.yellow(String(userModifiedCount))} kept (user-modified)`
        : '',
      conflictCount > 0 ? `${pc.red(String(conflictCount))} conflict(s)` : '',
    ]
      .filter(Boolean)
      .join(', '),
  );

  // Nothing to do
  if (
    autoUpgradeCount === 0 &&
    conflictCount === 0 &&
    userModifiedCount === 0
  ) {
    p.outro('Everything is up to date.');
    writeLockfile(
      cwd,
      buildLockfile(componentAnalyses, sharedAnalyses, lockfile),
    );
    return;
  }

  if (options.force) {
    p.log.warn(
      'Force mode — all files will be overwritten with upstream versions.',
    );
  }

  // Nothing actionable without force
  if (!options.force && autoUpgradeCount === 0 && conflictCount === 0) {
    p.outro('Everything is up to date.');
    writeLockfile(
      cwd,
      buildLockfile(componentAnalyses, sharedAnalyses, lockfile),
    );
    return;
  }

  if (!options.force) {
    // Confirm before proceeding
    if (autoUpgradeCount > 0 && conflictCount === 0) {
      const confirm = await p.confirm({
        message: `Apply ${autoUpgradeCount} auto-upgrade(s)?`,
        initialValue: true,
      });
      if (p.isCancel(confirm) || !confirm) {
        p.cancel('Upgrade cancelled.');
        process.exit(0);
      }
    } else if (conflictCount > 0) {
      p.log.warn(
        `${conflictCount} file(s) have conflicts that need manual resolution.`,
      );
      const proceed = await p.confirm({
        message: 'Continue with upgrade and resolve conflicts?',
        initialValue: true,
      });
      if (p.isCancel(proceed) || !proceed) {
        p.cancel('Upgrade cancelled.');
        process.exit(0);
      }
    }
  }

  // --- Resolve conflicts ---
  const resolutions = new Map<string, 'keep' | 'upstream'>();

  if (!options.force) {
    for (const comp of componentAnalyses) {
      for (const file of comp.files) {
        if (file.status === 'conflict') {
          const key = `${comp.name}/${file.file}`;
          const resolution = await resolveConflict(comp.name, file);
          resolutions.set(key, resolution);
        }
      }
    }

    for (const file of sharedAnalyses) {
      if (file.status === 'conflict') {
        const resolution = await resolveConflict('shared', file);
        resolutions.set(file.file, resolution);
      }
    }
  }

  // --- Apply changes ---
  const applySpinner = p.spinner();
  applySpinner.start('Applying upgrades...');

  let appliedCount = 0;
  let skippedCount = 0;
  const newLockfile = getOrCreateLockfile(cwd);

  for (const comp of componentAnalyses) {
    const destDir = resolve(componentsDir, comp.name);
    mkdirSync(destDir, { recursive: true });

    if (!newLockfile.components[comp.name]) {
      newLockfile.components[comp.name] = {};
    }

    for (const file of comp.files) {
      const destPath = join(destDir, file.file);
      const key = `${comp.name}/${file.file}`;

      // Overwrite when ANY of these are true:
      //   1. auto-upgrade  — user hasn't touched it, safe to update
      //   2. new-upstream  — file is new (didn't exist locally), no risk
      //   3. force + user-modified — explicit reset of user's edits
      //   4. conflict resolved as 'upstream' (or force) — user said take theirs
      const shouldOverwrite =
        file.status === 'auto-upgrade' ||
        file.status === 'new-upstream' ||
        (options.force && file.status === 'user-modified') ||
        (file.status === 'conflict' &&
          (options.force || resolutions.get(key) === 'upstream'));

      if (shouldOverwrite) {
        writeFileSync(destPath, file.newContent);
        newLockfile.components[comp.name][file.file] = {
          hash: hashContent(file.newContent),
        };
        appliedCount++;
      } else if (file.status === 'conflict') {
        // User chose to keep their version. We still advance the lockfile base
        // to the current upstream hash. This means on the next upgrade:
        //   - If upstream hasn't changed again: base==upstream but base!=current
        //     → shows as "user-modified" (not a conflict). Correct.
        //   - If upstream changes again: base=old-upstream ≠ new-upstream AND
        //     base ≠ user's current → conflict again. Correct.
        newLockfile.components[comp.name][file.file] = {
          hash: hashContent(file.newContent),
        };
        skippedCount++;
      } else if (file.status === 'user-modified') {
        newLockfile.components[comp.name][file.file] = lockfile.components[
          comp.name
        ]?.[file.file] ?? {
          hash: hashContent(file.newContent),
        };
        skippedCount++;
      } else {
        // up-to-date — record hash
        newLockfile.components[comp.name][file.file] = {
          hash: hashContent(file.newContent),
        };
      }
    }
  }

  // Apply shared files (theme only)
  for (const file of sharedAnalyses) {
    const fileName = file.file.split('/').pop()!;
    mkdirSync(themeDir, { recursive: true });
    const destPath = join(themeDir, fileName);

    const shouldOverwrite =
      file.status === 'auto-upgrade' ||
      file.status === 'new-upstream' ||
      (options.force && file.status === 'user-modified') ||
      (file.status === 'conflict' &&
        (options.force || resolutions.get(file.file) === 'upstream'));

    const entry = { hash: hashContent(file.newContent) };

    if (shouldOverwrite) {
      writeFileSync(destPath, file.newContent);
      newLockfile.theme[fileName] = entry;
      appliedCount++;
    } else if (file.status === 'conflict') {
      newLockfile.theme[fileName] = entry;
      skippedCount++;
    } else if (file.status === 'up-to-date') {
      newLockfile.theme[fileName] = entry;
    }
  }

  writeLockfile(cwd, newLockfile);

  applySpinner.stop('Done!');

  // --- Final summary ---
  if (appliedCount > 0) {
    p.log.success(`${pc.bold(String(appliedCount))} file(s) upgraded.`);
  }
  if (skippedCount > 0) {
    p.log.info(`${pc.bold(String(skippedCount))} file(s) kept as-is.`);
  }

  p.outro('Upgrade complete.');
};

/**
 * Build a fresh lockfile snapshot for the "nothing to apply" case
 */
const buildLockfile = (
  components: ComponentAnalysis[],
  shared: FileAnalysis[],
  existing: Lockfile,
): Lockfile => {
  const lockfile: Lockfile = { ...existing };

  for (const comp of components) {
    if (!lockfile.components[comp.name]) {
      lockfile.components[comp.name] = {};
    }
    for (const file of comp.files) {
      lockfile.components[comp.name][file.file] = {
        hash: hashContent(file.newContent),
      };
    }
  }

  for (const file of shared) {
    const fileName = file.file.split('/').pop()!;
    const entry = { hash: hashContent(file.newContent) };
    lockfile.theme[fileName] = entry;
  }

  return lockfile;
};

import * as p from '@clack/prompts';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import pc from 'picocolors';
import { configExists, readConfig } from '../config.js';
import { getComponentNames } from '../registry.js';
import {
  getComponentFiles,
  getComponentSourceDir,
  rewriteImports,
} from '../utils/resolve-paths.js';
import { getOrCreateLockfile, hashContent } from '../lockfile.js';
import {
  analyzeFile,
  summarizeComponent,
  STATUS_ICONS,
  type FileAnalysis,
  type FileStatus,
} from '../utils/analyze.js';

const STATUS_SHORT_LABELS: Record<FileStatus, string> = {
  'up-to-date': pc.dim('up to date'),
  'auto-upgrade': pc.blue('outdated'),
  'user-modified': pc.yellow('modified'),
  conflict: pc.red('conflict'),
  'new-upstream': pc.blue('new upstream'),
};

export const outdatedCommand = async (options: { json?: boolean }) => {
  const cwd = process.cwd();

  if (!options.json) {
    p.intro(pc.bold('blotch outdated'));
  }

  if (!configExists(cwd)) {
    if (options.json) {
      console.log(JSON.stringify({ error: 'no config found' }));
      process.exit(1);
    }
    p.log.error(
      `No ${pc.cyan('blotch.config.json')} found. Run ${pc.bold('blotch init')} first.`,
    );
    process.exit(1);
  }

  const config = readConfig(cwd);
  const componentsDir = resolve(cwd, config.aliases.components);

  if (!existsSync(componentsDir)) {
    if (options.json) {
      console.log(JSON.stringify({ components: [] }));
      return;
    }
    p.log.success('No components installed.');
    p.outro('');
    return;
  }

  const allKnown = new Set(getComponentNames());
  const installed = readdirSync(componentsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && allKnown.has(entry.name))
    .map((entry) => entry.name)
    .sort();

  if (installed.length === 0) {
    if (options.json) {
      console.log(JSON.stringify({ components: [] }));
      return;
    }
    p.log.success('No components installed.');
    p.outro('');
    return;
  }

  const lockfile = getOrCreateLockfile(cwd);
  const utilsDir = resolve(cwd, config.aliases.utils);

  const outdated: { name: string; status: FileStatus; fileCount: number }[] =
    [];

  for (const name of installed) {
    const srcDir = getComponentSourceDir(name);
    const destDir = resolve(componentsDir, name);
    const files = getComponentFiles(name);
    const lockedComponent = lockfile.components[name] ?? {};

    const fileAnalyses: FileAnalysis[] = [];

    for (const file of files) {
      const srcContent = readFileSync(join(srcDir, file), 'utf-8');
      const newContent = rewriteImports(srcContent, destDir, utilsDir);
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

    const overall = summarizeComponent({ name, files: fileAnalyses });
    if (overall !== 'up-to-date') {
      outdated.push({ name, status: overall, fileCount: files.length });
    }
  }

  if (options.json) {
    console.log(JSON.stringify({ components: outdated }, null, 2));
    process.exit(outdated.length > 0 ? 1 : 0);
  }

  if (outdated.length === 0) {
    p.log.success('All components are up to date.');
    p.outro('');
    return;
  }

  const maxNameLen = Math.max(...outdated.map((r) => r.name.length));

  for (const { name, status, fileCount } of outdated) {
    const paddedName = name.padEnd(maxNameLen);
    const filesLabel = fileCount === 1 ? '1 file' : `${fileCount} files`;
    p.log.message(
      `  ${STATUS_ICONS[status]} ${pc.bold(paddedName)}  ${STATUS_SHORT_LABELS[status]}  ${pc.dim(`(${filesLabel})`)}`,
    );
  }

  p.outro(
    `${outdated.length} component(s) need attention. Run ${pc.bold('blotch upgrade')} to apply.`,
  );
  process.exit(1);
};

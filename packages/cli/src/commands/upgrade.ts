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

const resolveConflict = async (
  componentName: string,
  analysis: FileAnalysis,
): Promise<'keep' | 'upstream'> => {
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

export const upgradeCommand = async (options: { force?: boolean }) => {
  const cwd = process.cwd();

  p.intro(pc.bold('blotch upgrade'));

  if (!configExists(cwd)) {
    p.log.error(
      `No ${pc.cyan('blotch.config.json')} found. Run ${pc.bold('blotch init')} first.`,
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
  const utilsDir = resolve(cwd, config.aliases.utils);

  // --- Analysis phase ---
  const s = p.spinner();
  s.start('Analyzing changes...');

  const componentAnalyses: ComponentAnalysis[] = [];

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

    componentAnalyses.push({ name, files: fileAnalyses });
  }

  // Analyze shared files (utils + theme)
  const uiSrc = getUiSourceDir();
  const sharedAnalyses: FileAnalysis[] = [];

  // cn.ts
  const cnSrc = join(uiSrc, 'utils', 'cn.ts');
  if (existsSync(cnSrc)) {
    const newContent = readFileSync(cnSrc, 'utf-8');
    const destPath = join(utilsDir, 'cn.ts');
    const currentContent = existsSync(destPath)
      ? readFileSync(destPath, 'utf-8')
      : null;
    const storedHash = lockfile.utils['cn.ts']?.hash ?? null;

    sharedAnalyses.push({
      file: 'utils/cn.ts',
      status: analyzeFile(currentContent, newContent, storedHash, hashContent),
      currentContent: currentContent ?? '',
      newContent,
    });
  }

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
        // User chose to keep — update baseline so next upgrade won't re-flag
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

  // Apply shared files
  for (const file of sharedAnalyses) {
    const isUtil = file.file.startsWith('utils/');
    const fileName = file.file.split('/').pop()!;
    let destPath: string;

    if (isUtil) {
      mkdirSync(utilsDir, { recursive: true });
      destPath = join(utilsDir, fileName);
    } else {
      mkdirSync(themeDir, { recursive: true });
      destPath = join(themeDir, fileName);
    }

    const shouldOverwrite =
      file.status === 'auto-upgrade' ||
      file.status === 'new-upstream' ||
      (options.force && file.status === 'user-modified') ||
      (file.status === 'conflict' &&
        (options.force || resolutions.get(file.file) === 'upstream'));

    const entry = { hash: hashContent(file.newContent) };

    if (shouldOverwrite) {
      writeFileSync(destPath, file.newContent);
      if (isUtil) newLockfile.utils[fileName] = entry;
      else newLockfile.theme[fileName] = entry;
      appliedCount++;
    } else if (file.status === 'conflict') {
      if (isUtil) newLockfile.utils[fileName] = entry;
      else newLockfile.theme[fileName] = entry;
      skippedCount++;
    } else if (file.status === 'up-to-date') {
      if (isUtil) newLockfile.utils[fileName] = entry;
      else newLockfile.theme[fileName] = entry;
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

// Build a fresh lockfile snapshot for the "nothing to apply" case
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
    const isUtil = file.file.startsWith('utils/');
    const fileName = file.file.split('/').pop()!;
    const entry = { hash: hashContent(file.newContent) };
    if (isUtil) lockfile.utils[fileName] = entry;
    else lockfile.theme[fileName] = entry;
  }

  return lockfile;
};

import * as p from '@clack/prompts';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import pc from 'picocolors';
import { configExists, readConfig } from '../config.js';
import {
  getComponentNames,
  getEntry,
  resolveDependencies,
} from '../registry.js';
import {
  getComponentFiles,
  getComponentSourceDir,
  rewriteImports,
} from '../utils/resolve-paths.js';
import {
  getOrCreateLockfile,
  hashContent,
  writeLockfile,
} from '../lockfile.js';

export const addCommand = async (components: string[]) => {
  const cwd = process.cwd();

  p.intro(pc.bold('dolan add'));

  if (!configExists(cwd)) {
    p.log.error(
      `No ${pc.cyan('dolan.config.json')} found. Run ${pc.bold('dolan init')} first.`,
    );
    process.exit(1);
  }

  const config = readConfig(cwd);
  const allComponents = getComponentNames();

  let selected: string[];

  if (components.length === 0) {
    const result = await p.multiselect({
      message: 'Which components would you like to add?',
      options: allComponents.map((name) => ({ value: name, label: name })),
      required: true,
    });

    if (p.isCancel(result)) {
      p.cancel('Cancelled.');
      process.exit(0);
    }

    selected = result as string[];
  } else {
    const invalid = components.filter((c) => !getEntry(c));
    if (invalid.length > 0) {
      p.log.error(
        `Unknown component(s): ${invalid.map((c) => pc.red(c)).join(', ')}`,
      );
      p.log.info(
        `Available: ${allComponents.map((c) => pc.cyan(c)).join(', ')}`,
      );
      process.exit(1);
    }
    selected = components;
  }

  const resolved = resolveDependencies(selected);
  const added = resolved.filter((name) => !selected.includes(name));

  if (added.length > 0) {
    p.log.info(
      `Adding dependencies: ${added.map((c) => pc.cyan(c)).join(', ')}`,
    );
  }

  const existing = resolved.filter((name) => {
    const destDir = resolve(cwd, config.aliases.components, name);
    return existsSync(destDir);
  });

  if (existing.length > 0) {
    const overwrite = await p.confirm({
      message: `${existing.map((c) => pc.yellow(c)).join(', ')} already exist. Overwrite?`,
      initialValue: false,
    });

    if (p.isCancel(overwrite) || !overwrite) {
      const filtered = resolved.filter((name) => !existing.includes(name));
      if (filtered.length === 0) {
        p.cancel('Nothing to add.');
        process.exit(0);
      }
      resolved.splice(0, resolved.length, ...filtered);
    }
  }

  const s = p.spinner();
  s.start('Adding components...');

  const componentsDir = resolve(cwd, config.aliases.components);
  const lockfile = getOrCreateLockfile(cwd);

  for (const name of resolved) {
    const srcDir = getComponentSourceDir(name);
    const destDir = resolve(componentsDir, name);
    mkdirSync(destDir, { recursive: true });

    if (!lockfile.components[name]) {
      lockfile.components[name] = {};
    }

    const files = getComponentFiles(name);
    for (const file of files) {
      const content = readFileSync(join(srcDir, file), 'utf-8');
      const rewritten = rewriteImports(content);
      writeFileSync(join(destDir, file), rewritten);
      lockfile.components[name][file] = { hash: hashContent(rewritten) };
    }
  }

  writeLockfile(cwd, lockfile);

  s.stop('Done!');

  p.log.success(
    `Added ${resolved.length} component(s): ${resolved.map((c) => pc.green(c)).join(', ')}`,
  );

  p.outro('Components are ready to use.');
};

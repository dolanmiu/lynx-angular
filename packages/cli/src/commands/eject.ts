import * as p from '@clack/prompts';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import pc from 'picocolors';
import { configExists, readConfig } from '../config.js';
import { getEntry, getComponentNames } from '../registry.js';
import { getOrCreateLockfile, writeLockfile } from '../lockfile.js';

export const ejectCommand = async (
  component: string,
  options: { force?: boolean },
) => {
  const cwd = process.cwd();

  p.intro(pc.bold('blotch eject'));

  if (!configExists(cwd)) {
    p.log.error(
      `No ${pc.cyan('blotch.config.json')} found. Run ${pc.bold('blotch init')} first.`,
    );
    process.exit(1);
  }

  if (!getEntry(component)) {
    p.log.error(
      `Unknown component ${pc.bold(component)}. Available: ${getComponentNames().join(', ')}`,
    );
    process.exit(1);
  }

  const config = readConfig(cwd);
  const componentsDir = resolve(cwd, config.aliases.components);
  const componentDir = resolve(componentsDir, component);

  if (!existsSync(componentDir)) {
    p.log.error(`${pc.bold(component)} is not installed.`);
    process.exit(1);
  }

  const lockfile = getOrCreateLockfile(cwd);

  if (!lockfile.components[component]) {
    p.log.warn(`${pc.bold(component)} is already untracked.`);
    p.outro('Done.');
    return;
  }

  if (!options.force) {
    const confirm = await p.confirm({
      message: `Stop tracking ${pc.bold(component)}? Upgrades will no longer detect changes. Files will remain untouched.`,
      initialValue: false,
    });

    if (p.isCancel(confirm) || !confirm) {
      p.cancel('Eject cancelled.');
      process.exit(0);
    }
  }

  delete lockfile.components[component];
  writeLockfile(cwd, lockfile);

  p.log.success(
    `${pc.bold(component)} ejected. Files kept at ${pc.dim(config.aliases.components + '/' + component)}`,
  );
  p.outro('Component is no longer tracked by blotch.');
};

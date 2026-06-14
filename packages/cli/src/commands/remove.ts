import * as p from '@clack/prompts';
import { existsSync, readdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import pc from 'picocolors';
import { configExists, readConfig } from '../config.js';
import { getEntry, getComponentNames, registry } from '../registry.js';
import { getOrCreateLockfile, writeLockfile } from '../lockfile.js';

export const removeCommand = async (
  component: string,
  options: { force?: boolean },
) => {
  const cwd = process.cwd();

  p.intro(pc.bold('blotch remove'));

  if (!configExists(cwd)) {
    p.log.error(
      `No ${pc.cyan('blotch.config.json')} found. Run ${pc.bold('blotch init')} first.`,
    );
    process.exit(1);
  }

  const entry = getEntry(component);
  if (!entry) {
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

  // Find which installed components depend on this one
  const allKnown = new Set(getComponentNames());
  const installed = new Set(
    existsSync(componentsDir)
      ? readdirSync(componentsDir, { withFileTypes: true })
          .filter((e) => e.isDirectory() && allKnown.has(e.name))
          .map((e) => e.name)
      : [],
  );

  const dependents = registry.filter(
    (r) =>
      r.dependencies.includes(component) &&
      installed.has(r.name) &&
      r.name !== component,
  );

  if (dependents.length > 0 && !options.force) {
    p.log.warn(
      `The following installed components depend on ${pc.bold(component)}: ${dependents.map((d) => pc.bold(d.name)).join(', ')}`,
    );
    const proceed = await p.confirm({
      message: 'Remove anyway? This may break those components.',
      initialValue: false,
    });
    if (p.isCancel(proceed) || !proceed) {
      p.cancel('Removal cancelled.');
      process.exit(0);
    }
  }

  // Identify orphaned dependencies
  const removalSet = new Set([component]);

  if (entry.dependencies.length > 0) {
    const orphans = findOrphans(component, installed, removalSet);

    if (orphans.length > 0 && !options.force) {
      const removeOrphans = await p.confirm({
        message: `Also remove orphaned dependencies? (${orphans.map((o) => pc.bold(o)).join(', ')})`,
        initialValue: true,
      });

      if (!p.isCancel(removeOrphans) && removeOrphans) {
        for (const orphan of orphans) {
          removalSet.add(orphan);
        }
      }
    } else if (options.force) {
      for (const orphan of findOrphans(component, installed, removalSet)) {
        removalSet.add(orphan);
      }
    }
  }

  // Perform removal
  const lockfile = getOrCreateLockfile(cwd);

  for (const name of removalSet) {
    const dir = resolve(componentsDir, name);
    if (existsSync(dir)) {
      rmSync(dir, { recursive: true });
    }
    delete lockfile.components[name];
  }

  writeLockfile(cwd, lockfile);

  const removed = [...removalSet].sort();
  p.log.success(`Removed: ${removed.map((n) => pc.bold(n)).join(', ')}`);
  p.outro('Done.');
};

/**
 * Find dependencies of `target` that are installed but no longer needed by
 * any other installed component (excluding those already in the removal set).
 */
const findOrphans = (
  target: string,
  installed: Set<string>,
  removalSet: Set<string>,
): string[] => {
  const targetEntry = getEntry(target);
  if (!targetEntry) return [];

  const orphans: string[] = [];

  for (const dep of targetEntry.dependencies) {
    if (!installed.has(dep)) continue;
    if (removalSet.has(dep)) continue;

    // Check if any other installed component (not being removed) depends on this
    const stillNeeded = registry.some(
      (r) =>
        r.name !== target &&
        !removalSet.has(r.name) &&
        installed.has(r.name) &&
        r.dependencies.includes(dep),
    );

    if (!stillNeeded) {
      orphans.push(dep);
    }
  }

  return orphans;
};

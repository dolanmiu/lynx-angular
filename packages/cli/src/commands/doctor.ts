import * as p from '@clack/prompts';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import pc from 'picocolors';
import { configExists, readConfig, type BlotchConfig } from '../config.js';
import { getEntry } from '../registry.js';
import { getComponentFiles } from '../utils/resolve-paths.js';

export const doctorCommand = async () => {
  const cwd = process.cwd();
  const counts = { pass: 0, warn: 0, fail: 0 };

  const pass = (msg: string) => {
    counts.pass++;
    p.log.success(msg);
  };

  const warn = (msg: string) => {
    counts.warn++;
    p.log.warn(msg);
  };

  const fail = (msg: string) => {
    counts.fail++;
    p.log.error(msg);
  };

  p.intro(pc.bold('blotch doctor'));

  // --- 1. Config ---

  const config = checkConfig(cwd, pass, fail);

  if (!config) {
    p.outro(pc.red('Fix config issues before continuing.'));
    process.exit(1);
  }

  // --- 2. Directories ---

  checkDirectories(cwd, config, pass, fail);

  // --- 3. Required files ---

  checkRequiredFiles(cwd, config, pass, warn);

  // --- 4. Tailwind integration ---

  checkTailwind(cwd, pass, warn);

  // --- 5. Package dependencies ---

  checkPackageDeps(cwd, pass, warn, fail);

  // --- 6. Component health ---

  checkComponentHealth(cwd, config, pass, warn);

  // --- Summary ---

  const parts: string[] = [];
  if (counts.pass > 0) parts.push(pc.green(`${counts.pass} passed`));
  if (counts.warn > 0) parts.push(pc.yellow(`${counts.warn} warning(s)`));
  if (counts.fail > 0) parts.push(pc.red(`${counts.fail} failed`));

  p.outro(parts.join(pc.dim(' · ')));

  process.exit(counts.fail > 0 ? 1 : 0);
};

// --- Check implementations ---

const checkConfig = (
  cwd: string,
  pass: (msg: string) => void,
  fail: (msg: string) => void,
): BlotchConfig | undefined => {
  if (!configExists(cwd)) {
    fail(
      `${pc.cyan('blotch.config.json')} not found. Run ${pc.bold('blotch init')} first.`,
    );
    return undefined;
  }

  try {
    const config = readConfig(cwd);
    const aliases = config?.aliases;
    const requiredKeys = ['components', 'utils', 'theme'] as const;
    const missing = requiredKeys.filter(
      (key) => typeof aliases?.[key] !== 'string' || aliases[key].length === 0,
    );

    if (missing.length > 0) {
      fail(
        `Config missing aliases: ${missing.map((k) => pc.cyan(k)).join(', ')}`,
      );
      return undefined;
    }

    pass('Config is valid');
    return config;
  } catch {
    fail(`${pc.cyan('blotch.config.json')} is not valid JSON`);
    return undefined;
  }
};

const checkDirectories = (
  cwd: string,
  config: BlotchConfig,
  pass: (msg: string) => void,
  fail: (msg: string) => void,
) => {
  const dirs = [
    { key: 'components', path: config.aliases.components },
    { key: 'utils', path: config.aliases.utils },
    { key: 'theme', path: config.aliases.theme },
  ] as const;

  for (const { key, path } of dirs) {
    const abs = resolve(cwd, path);
    if (existsSync(abs) && statSync(abs).isDirectory()) {
      pass(`${pc.cyan(key)} directory exists (${pc.dim(path)})`);
    } else {
      fail(`${pc.cyan(key)} directory missing: ${pc.dim(path)}`);
    }
  }
};

const checkRequiredFiles = (
  cwd: string,
  config: BlotchConfig,
  pass: (msg: string) => void,
  warn: (msg: string) => void,
) => {
  const utilsDir = resolve(cwd, config.aliases.utils);
  const themeDir = resolve(cwd, config.aliases.theme);

  if (existsSync(join(utilsDir, 'cn.ts'))) {
    pass(`${pc.cyan('cn.ts')} found in utils`);
  } else {
    warn(`${pc.cyan('cn.ts')} missing from ${pc.dim(config.aliases.utils)}`);
  }

  if (existsSync(join(themeDir, 'tailwind-plugin.ts'))) {
    pass(`${pc.cyan('tailwind-plugin.ts')} found in theme`);
  } else {
    warn(
      `${pc.cyan('tailwind-plugin.ts')} missing from ${pc.dim(config.aliases.theme)}`,
    );
  }

  const hasThemeCss =
    existsSync(join(themeDir, 'default.css')) ||
    existsSync(join(themeDir, 'dark.css'));
  if (hasThemeCss) {
    pass('Theme CSS found');
  } else {
    warn(`No theme CSS files in ${pc.dim(config.aliases.theme)}`);
  }
};

const checkTailwind = (
  cwd: string,
  pass: (msg: string) => void,
  warn: (msg: string) => void,
) => {
  const candidates = ['tailwind.config.ts', 'tailwind.config.js'];
  const found = candidates.find((f) => existsSync(resolve(cwd, f)));

  if (!found) {
    warn('No Tailwind config found');
    return;
  }

  pass(`Tailwind config found (${pc.dim(found)})`);

  const content = readFileSync(resolve(cwd, found), 'utf-8');
  if (content.includes('blotchPlugin')) {
    pass(`${pc.cyan('blotchPlugin')} referenced in Tailwind config`);
  } else {
    warn(
      `${pc.cyan('blotchPlugin')} not found in ${pc.dim(found)} — add it to your plugins array`,
    );
  }
};

const checkPackageDeps = (
  cwd: string,
  pass: (msg: string) => void,
  warn: (msg: string) => void,
  fail: (msg: string) => void,
) => {
  const pkgPath = resolve(cwd, 'package.json');
  if (!existsSync(pkgPath)) {
    fail(`${pc.cyan('package.json')} not found`);
    return;
  }

  let pkg: Record<string, unknown>;
  try {
    pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  } catch {
    fail(`${pc.cyan('package.json')} is not valid JSON`);
    return;
  }

  const deps = {
    ...(pkg.dependencies as Record<string, string> | undefined),
    ...(pkg.devDependencies as Record<string, string> | undefined),
  };

  const required = [
    '@angular/core',
    '@angular/common',
    '@angular/platform-browser',
    '@angular/router',
  ];

  const missingAngular = required.filter((dep) => !deps[dep]);
  if (missingAngular.length === 0) {
    pass('Angular packages found');
  } else {
    fail(
      `Missing Angular packages: ${missingAngular.map((d) => pc.cyan(d)).join(', ')}`,
    );
  }

  if (deps['@blotch/angular-lynx']) {
    pass(`${pc.cyan('@blotch/angular-lynx')} found`);
  } else {
    fail(`${pc.cyan('@blotch/angular-lynx')} not found in dependencies`);
  }

  if (deps['tailwindcss']) {
    pass(`${pc.cyan('tailwindcss')} found`);
  } else {
    warn(
      `${pc.cyan('tailwindcss')} not found — required if using blotch UI components`,
    );
  }
};

const checkComponentHealth = (
  cwd: string,
  config: BlotchConfig,
  pass: (msg: string) => void,
  warn: (msg: string) => void,
) => {
  const componentsDir = resolve(cwd, config.aliases.components);
  if (!existsSync(componentsDir)) return;

  let installed: string[];
  try {
    installed = readdirSync(componentsDir).filter((name) =>
      statSync(join(componentsDir, name)).isDirectory(),
    );
  } catch {
    return;
  }

  if (installed.length === 0) return;

  let allHealthy = true;

  for (const name of installed) {
    const entry = getEntry(name);
    if (!entry) {
      warn(`${pc.cyan(name)} is not a known blotch component`);
      allHealthy = false;
      continue;
    }

    // Check that all expected source files are present
    try {
      const expectedFiles = getComponentFiles(name);
      const destDir = join(componentsDir, name);
      const missingFiles = expectedFiles.filter(
        (f) => !existsSync(join(destDir, f)),
      );

      if (missingFiles.length > 0) {
        warn(
          `${pc.cyan(name)} is missing files: ${missingFiles.map((f) => pc.dim(f)).join(', ')}`,
        );
        allHealthy = false;
      }
    } catch {
      warn(`${pc.cyan(name)} — could not verify source files`);
      allHealthy = false;
    }

    // Check dependency consistency
    for (const dep of entry.dependencies) {
      if (!installed.includes(dep)) {
        warn(
          `${pc.cyan(name)} requires ${pc.cyan(dep)} — run ${pc.bold(`blotch add ${dep}`)}`,
        );
        allHealthy = false;
      }
    }
  }

  if (allHealthy) {
    pass(
      `${installed.length} component(s) healthy: ${installed.map((c) => pc.cyan(c)).join(', ')}`,
    );
  }
};

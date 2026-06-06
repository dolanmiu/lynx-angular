import * as p from '@clack/prompts';
import { existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import pc from 'picocolors';
import { configExists, writeConfig } from '../config.js';
import { getUiSourceDir } from '../utils/resolve-paths.js';

export const initCommand = async () => {
  const cwd = process.cwd();

  p.intro(pc.bold('blotch init'));

  if (configExists(cwd)) {
    const overwrite = await p.confirm({
      message: 'blotch.config.json already exists. Overwrite?',
      initialValue: false,
    });

    if (p.isCancel(overwrite) || !overwrite) {
      p.cancel('Init cancelled.');
      process.exit(0);
    }
  }

  const config = await p.group(
    {
      components: () =>
        p.text({
          message: 'Where should components be installed?',
          placeholder: 'src/components/ui',
          defaultValue: 'src/components/ui',
        }),
      utils: () =>
        p.text({
          message: 'Where should utilities (cn, etc.) be installed?',
          placeholder: 'src/lib/utils',
          defaultValue: 'src/lib/utils',
        }),
      theme: () =>
        p.text({
          message: 'Where should theme files be installed?',
          placeholder: 'src/styles',
          defaultValue: 'src/styles',
        }),
    },
    {
      onCancel: () => {
        p.cancel('Init cancelled.');
        process.exit(0);
      },
    },
  );

  const s = p.spinner();
  s.start('Setting up blotch...');

  writeConfig(cwd, {
    aliases: {
      components: config.components,
      utils: config.utils,
      theme: config.theme,
    },
  });

  const uiSrc = getUiSourceDir();

  const utilsDir = resolve(cwd, config.utils);
  mkdirSync(utilsDir, { recursive: true });
  copyFileSync(join(uiSrc, 'utils', 'cn.ts'), join(utilsDir, 'cn.ts'));

  const themeDir = resolve(cwd, config.theme);
  mkdirSync(themeDir, { recursive: true });

  const themeFiles = ['default.css', 'dark.css'];
  for (const file of themeFiles) {
    const src = join(uiSrc, 'theme', file);
    if (existsSync(src)) {
      copyFileSync(src, join(themeDir, file));
    }
  }

  copyFileSync(
    join(uiSrc, 'theme', 'tailwind-plugin.ts'),
    join(themeDir, 'tailwind-plugin.ts'),
  );

  s.stop('Setup complete!');

  const componentsDir = resolve(cwd, config.components);
  mkdirSync(componentsDir, { recursive: true });

  p.note(
    [
      `${pc.bold('1.')} Add the Tailwind plugin to your ${pc.cyan('tailwind.config.ts')}:`,
      '',
      `   ${pc.dim("import { blotchPlugin } from './")}${pc.dim(config.theme)}${pc.dim("/tailwind-plugin';")}`,
      `   ${pc.dim('plugins: [blotchPlugin]')}`,
      '',
      `${pc.bold('2.')} Import a theme in your global styles:`,
      '',
      `   ${pc.dim("@import './")}${pc.dim(config.theme)}${pc.dim("/default.css';")}`,
      '',
      `${pc.bold('3.')} Add components:`,
      '',
      `   ${pc.dim('npx blotch add button card')}`,
    ].join('\n'),
    'Next steps',
  );

  p.outro('Ready to go!');
};

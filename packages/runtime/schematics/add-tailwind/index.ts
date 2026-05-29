import type { Rule, Tree } from '@angular-devkit/schematics';
import { chain, SchematicsException } from '@angular-devkit/schematics';
import {
  addDependency,
  DependencyType,
  InstallBehavior,
} from '@schematics/angular/utility/dependency';
import { getWorkspace } from '@schematics/angular/utility/workspace';

import type { Schema } from './schema';
import { VERSIONS } from '../ng-add/versions';

export default (options: Schema): Rule =>
  async (tree: Tree) => {
    const workspace = await getWorkspace(tree);
    const projectName =
      options.project ??
      (workspace.extensions['defaultProject'] as string | undefined) ??
      [...workspace.projects.keys()][0];

    if (!projectName) {
      throw new SchematicsException(
        'No project found. Run this schematic inside an Angular workspace.',
      );
    }

    const project = workspace.projects.get(projectName);
    if (!project) {
      throw new SchematicsException(
        `Project "${projectName}" not found in angular.json.`,
      );
    }

    const sourceRoot = (project.sourceRoot ?? `${project.root}/src`) as string;
    const projectRoot = project.root as string;

    return chain([
      addTailwindConfig(projectRoot),
      updateStylesCss(sourceRoot),
      addTailwindDependencies(),
    ]);
  };

const addTailwindConfig = (projectRoot: string): Rule => {
  return (tree: Tree) => {
    const configPath = `${projectRoot ? projectRoot + '/' : ''}tailwind.config.ts`;
    const content = `import type { Config } from 'tailwindcss';
import preset from '@lynx-js/tailwind-preset';

const config: Config = {
  content: ['./src/**/*.ts'],
  presets: [preset],
};

export default config;
`;
    if (tree.exists(configPath)) {
      tree.overwrite(configPath, content);
    } else {
      tree.create(configPath, content);
    }
  };
};

const updateStylesCss = (sourceRoot: string): Rule => {
  return (tree: Tree) => {
    const cssPath = `${sourceRoot}/styles.css`;
    const scssPath = `${sourceRoot}/styles.scss`;
    const targetPath = tree.exists(scssPath) ? scssPath : cssPath;

    const content = `@tailwind base;
@tailwind utilities;
`;

    if (tree.exists(targetPath)) {
      tree.overwrite(targetPath, content);
    } else {
      tree.create(cssPath, content);
    }
  };
};

const addTailwindDependencies = (): Rule => {
  return chain([
    addDependency('tailwindcss', VERSIONS.tailwindcss, {
      type: DependencyType.Dev,
      install: InstallBehavior.Auto,
    }),
    addDependency('@lynx-js/tailwind-preset', VERSIONS.tailwindPreset, {
      type: DependencyType.Dev,
      install: InstallBehavior.Auto,
    }),
  ]);
};

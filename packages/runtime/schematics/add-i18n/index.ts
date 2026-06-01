import type { Rule, Tree } from '@angular-devkit/schematics';
import { chain, SchematicsException } from '@angular-devkit/schematics';
import {
  addDependency,
  DependencyType,
  InstallBehavior,
} from '@schematics/angular/utility/dependency';
import { JSONFile } from '@schematics/angular/utility/json-file';
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
      addI18nToAngularJson(projectName),
      addLocalizeTypes(projectRoot),
      updateAppConfig(sourceRoot),
      addLocalizeDependency(),
    ]);
  };

const addI18nToAngularJson = (projectName: string): Rule => {
  return (tree: Tree) => {
    const angularJson = new JSONFile(tree, '/angular.json');

    const existingI18n = angularJson.get([
      'projects',
      projectName,
      'i18n',
    ]);
    if (!existingI18n) {
      angularJson.modify(['projects', projectName, 'i18n'], {
        sourceLocale: 'en-US',
      });
    }

    const polyfillsPath = [
      'projects',
      projectName,
      'architect',
      'build',
      'options',
      'polyfills',
    ];
    const polyfills =
      (angularJson.get(polyfillsPath) as string[] | undefined) ?? [];
    if (!polyfills.includes('@angular/localize/init')) {
      angularJson.modify(polyfillsPath, [
        ...polyfills,
        '@angular/localize/init',
      ]);
    }
  };
};

const addLocalizeTypes = (projectRoot: string): Rule => {
  return (tree: Tree) => {
    const tsconfigPath = `${projectRoot ? projectRoot + '/' : ''}tsconfig.app.json`;
    if (!tree.exists(tsconfigPath)) {
      return;
    }

    const tsconfig = new JSONFile(tree, tsconfigPath);
    const types = (tsconfig.get(['compilerOptions', 'types']) as string[]) ?? [];

    if (!types.includes('@angular/localize')) {
      tsconfig.modify(
        ['compilerOptions', 'types'],
        [...types, '@angular/localize'],
      );
    }
  };
};

const updateAppConfig = (sourceRoot: string): Rule => {
  return (tree: Tree) => {
    const configPath = `${sourceRoot}/app/app.config.ts`;
    if (!tree.exists(configPath)) {
      return;
    }

    let content = tree.readText(configPath);

    // Skip if provideLocale is already present
    if (content.includes('provideLocale')) {
      return;
    }

    // Add provideLocale to existing @blotch/angular-lynx import
    if (content.includes("from '@blotch/angular-lynx'")) {
      content = content.replace(
        /import\s*\{([^}]*)\}\s*from\s*['"]@blotch\/angular-lynx['"]/,
        (match, imports: string) => {
          const importList = imports
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean);
          importList.push('provideLocale');
          return `import { ${importList.join(', ')} } from '@blotch/angular-lynx'`;
        },
      );
    } else {
      // Add a new import line
      content =
        `import { provideLocale } from '@blotch/angular-lynx';\n` + content;
    }

    // Add provideLocale() to the providers array
    content = content.replace(
      /providers:\s*\[/,
      'providers: [\n    provideLocale(),',
    );

    tree.overwrite(configPath, content);
  };
};

const addLocalizeDependency = (): Rule => {
  return addDependency('@angular/localize', VERSIONS.angularLocalize, {
    type: DependencyType.Dev,
    install: InstallBehavior.Auto,
  });
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const dependency_1 = require("@schematics/angular/utility/dependency");
const json_file_1 = require("@schematics/angular/utility/json-file");
const workspace_1 = require("@schematics/angular/utility/workspace");
const versions_1 = require("../ng-add/versions");
exports.default = (options) => async (tree) => {
    const workspace = await (0, workspace_1.getWorkspace)(tree);
    const projectName = options.project ??
        workspace.extensions['defaultProject'] ??
        [...workspace.projects.keys()][0];
    if (!projectName) {
        throw new schematics_1.SchematicsException('No project found. Run this schematic inside an Angular workspace.');
    }
    const project = workspace.projects.get(projectName);
    if (!project) {
        throw new schematics_1.SchematicsException(`Project "${projectName}" not found in angular.json.`);
    }
    const sourceRoot = (project.sourceRoot ?? `${project.root}/src`);
    const projectRoot = project.root;
    return (0, schematics_1.chain)([
        addI18nToAngularJson(projectName),
        addLocalizeTypes(projectRoot),
        updateAppConfig(sourceRoot),
        addLocalizeDependency(),
    ]);
};
const addI18nToAngularJson = (projectName) => {
    return (tree) => {
        const angularJson = new json_file_1.JSONFile(tree, '/angular.json');
        const existingI18n = angularJson.get([
            'projects',
            projectName,
            'i18n',
        ]);
        // Don't overwrite if i18n is already configured
        if (!existingI18n) {
            angularJson.modify(['projects', projectName, 'i18n'], {
                sourceLocale: 'en-US',
            });
        }
    };
};
const addLocalizeTypes = (projectRoot) => {
    return (tree) => {
        const tsconfigPath = `${projectRoot ? projectRoot + '/' : ''}tsconfig.app.json`;
        if (!tree.exists(tsconfigPath)) {
            return;
        }
        const tsconfig = new json_file_1.JSONFile(tree, tsconfigPath);
        const types = tsconfig.get(['compilerOptions', 'types']) ?? [];
        if (!types.includes('@angular/localize')) {
            tsconfig.modify(['compilerOptions', 'types'], [...types, '@angular/localize']);
        }
    };
};
const updateAppConfig = (sourceRoot) => {
    return (tree) => {
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
            content = content.replace(/import\s*\{([^}]*)\}\s*from\s*['"]@blotch\/angular-lynx['"]/, (match, imports) => {
                const importList = imports
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean);
                importList.push('provideLocale');
                return `import { ${importList.join(', ')} } from '@blotch/angular-lynx'`;
            });
        }
        else {
            // Add a new import line
            content =
                `import { provideLocale } from '@blotch/angular-lynx';\n` + content;
        }
        // Add provideLocale() to the providers array
        content = content.replace(/providers:\s*\[/, 'providers: [\n    provideLocale(),');
        tree.overwrite(configPath, content);
    };
};
const addLocalizeDependency = () => {
    return (0, dependency_1.addDependency)('@angular/localize', versions_1.VERSIONS.angularLocalize, {
        type: dependency_1.DependencyType.Dev,
        install: dependency_1.InstallBehavior.Auto,
    });
};

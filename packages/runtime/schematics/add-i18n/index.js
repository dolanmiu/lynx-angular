"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const dependency_1 = require("@schematics/angular/utility/dependency");
const json_file_1 = require("@schematics/angular/utility/json-file");
const workspace_1 = require("@schematics/angular/utility/workspace");
const versions_1 = require("../ng-add/versions");
/**
 * Wires Angular's `@angular/localize` package into an AngularLynx app and
 * provides the Lynx-aware `provideLocale()` provider that reads the active
 * locale from Lynx's SystemInfo.
 *
 * Four-step setup, each step idempotent so re-running is safe:
 *   1. **angular.json `i18n` block** — declares the source locale so any
 *      `ng extract-i18n` runs produce the right XLIFF.
 *   2. **`@angular/localize/init` polyfill** — must run before the app boots
 *      so the global `$localize` function exists when components are
 *      instantiated.
 *   3. **tsconfig `types`** — adds @angular/localize so $localize is typed
 *      and TypeScript doesn't flag it as an undefined global.
 *   4. **provideLocale() in app.config** — registers the runtime provider
 *      that reads SystemInfo.language / appLocale and applies it to Angular's
 *      LOCALE_ID token.
 */
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
        const existingI18n = angularJson.get(['projects', projectName, 'i18n']);
        if (!existingI18n) {
            angularJson.modify(['projects', projectName, 'i18n'], {
                sourceLocale: 'en-US',
            });
        }
        // `@angular/localize/init` must be in `polyfills`, not a regular import.
        // It patches the global `$localize` function before the app boots — if
        // it's loaded lazily via a normal import, some translated strings can be
        // called before the patch is in place and throw at runtime.
        const polyfillsPath = [
            'projects',
            projectName,
            'architect',
            'build',
            'options',
            'polyfills',
        ];
        const polyfills = angularJson.get(polyfillsPath) ?? [];
        if (!polyfills.includes('@angular/localize/init')) {
            angularJson.modify(polyfillsPath, [
                ...polyfills,
                '@angular/localize/init',
            ]);
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
        // Idempotency guard: if the user has already imported provideLocale
        // (either from a previous run or by hand), bail out — re-running would
        // duplicate the import and the providers entry, breaking the file.
        if (content.includes('provideLocale')) {
            return;
        }
        // Two paths for adding the symbol to imports:
        //   - If `@blotch/angular-lynx` is already imported (the common case
        //     after `ng add @blotch/angular-lynx`), append provideLocale to the
        //     existing destructured import list. We split on `,` and rebuild so
        //     trailing commas and whitespace are normalized regardless of the
        //     user's formatting preferences.
        //   - Otherwise prepend a brand-new import line at the top of the file.
        //     This branch shouldn't normally fire (add-i18n is meant to run on
        //     projects that already went through ng-add), but it keeps the
        //     schematic self-contained if someone runs it standalone.
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
            content =
                `import { provideLocale } from '@blotch/angular-lynx';\n` + content;
        }
        // Insert provideLocale() as the FIRST provider so it runs before
        // anything that might call $localize during construction (e.g. a service
        // that formats a date with a localized pattern at module load time).
        // The regex matches `providers: [` and inserts on a new line right
        // after, preserving the user's indentation/style for the rest of the array.
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

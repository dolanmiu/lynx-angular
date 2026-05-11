import fs from 'node:fs';
import path from 'node:path';
import {
  createAngularCompilation,
  DiagnosticModes,
} from '@angular/build/src/tools/angular/compilation';
import { JavaScriptTransformer } from '@angular/build/src/tools/esbuild/javascript-transformer';
import type { RsbuildPluginAPI } from '@lynx-js/rspeedy';
import { applyAngularConfig } from './utils/angular/angular-config.js';
import { generateComponentScopeId } from './utils/angular/component-scope-id.js';
import { maxWorkers, useTypeChecking } from './utils/angular/env.js';
import { readBuildOptions } from './utils/angular/options.js';
import {
  getAngularWorkspace,
  getProjectByCwd,
} from './utils/angular/read-workspace.js';

export const applyAngularRules = async (
  api: RsbuildPluginAPI,
): Promise<void> => {
  const { basePath, workspace } = await getAngularWorkspace();
  const project = getProjectByCwd(workspace, basePath);
  if (!project) {
    throw new Error("couldn't find the project");
  }
  const projectDefinition = workspace.projects.get(project);
  if (!projectDefinition) {
    throw new Error(`Project "${project}" not found in workspace`);
  }
  const buildOptions = await readBuildOptions(projectDefinition, basePath);
  if (!buildOptions) {
    throw new Error(`Failed to read build options for project "${project}"`);
  }
  applyAngularConfig(api, buildOptions);
  const sourcemap = !!(
    !!buildOptions.sourcemapOptions.scripts &&
    (buildOptions.sourcemapOptions.hidden ? 'external' : true)
  );
  const thirdPartySourcemaps = buildOptions.sourcemapOptions.vendor;
  const advancedOptimizations = buildOptions.advancedOptimizations;
  const javascriptTransformer = new JavaScriptTransformer(
    {
      sourcemap,
      thirdPartySourcemaps,
      advancedOptimizations,
      jit: false,
    },
    maxWorkers,
    undefined,
  );
  const tsconfig = buildOptions.tsconfig;
  const compilation = await createAngularCompilation(false, true);
  const typeScriptFileCache = new Map<string, string | Uint8Array>();
  // Determines if TypeScript should process JavaScript files based on tsconfig `allowJs` option
  // let shouldTsIgnoreJs = true;
  // Determines if transpilation should be handle by TypeScript or esbuild
  // let useTypeScriptTranspilation = true;
  const componentStylesCache = new Map<
    string,
    {
      imports: string[];
      inlineStyles: string[];
      scopeId: string;
    }
  >();
  const componentScopeIds = new Map<
    string,
    { className: string; scopeId: string }
  >();
  api.onBeforeEnvironmentCompile(async () => {
    // Initialize the Angular compilation for the current build.
    // In watch mode, previous build state will be reused.
    // let referencedFiles;
    // let externalStylesheets;
    try {
      await compilation.initialize(
        tsconfig,
        {
          processWebWorker: (workerFile, _containingFile) => {
            return workerFile;
          },
          async transformStylesheet(
            data,
            containingFile,
            stylesheetFile,
            order,
            className,
          ) {
            const resolvedClassName = className ?? 'Component';
            const scopeId = generateComponentScopeId(
              resolvedClassName,
              containingFile,
            );
            let componentStyles = componentStylesCache.get(containingFile);
            if (!componentStyles) {
              componentStyles = {
                imports: [],
                inlineStyles: [],
                scopeId,
              };
              componentStylesCache.set(containingFile, componentStyles);
            }
            componentScopeIds.set(containingFile, {
              className: resolvedClassName,
              scopeId,
            });

            // Use raw CSS without Angular's encapsulateStyle scoping.
            // Angular's encapsulateStyle generates [_ngcontent-xxx] attribute selectors,
            // and even class-conjunction replacements (.class._ngscope-xxx) don't work
            // because the Lynx template stores the scope ID separately from element class
            // lists — elements only get their component classes (e.g. "nav-title"), not
            // scope classes. Plain class selectors (.nav-title) match correctly since
            // enableCSSSelector handles them, and per-component scoping in the template
            // already associates the CSS with the right component scope.
            const scopedCss = data;

            const writeIfChanged = (
              filePath: string,
              content: string,
            ): void => {
              try {
                if (fs.readFileSync(filePath, 'utf-8') === content) return;
              } catch {}
              fs.writeFileSync(filePath, content);
            };

            if (stylesheetFile) {
              const scopedPath = `${stylesheetFile}.__scoped_${scopeId}.css`;
              writeIfChanged(scopedPath, scopedCss);
              componentStyles.imports.push(scopedPath);
            } else {
              const containingDir = path.dirname(containingFile);
              const scopedPath = path.join(
                containingDir,
                `__inline_${resolvedClassName}_${order}.__scoped_${scopeId}.css`,
              );
              writeIfChanged(scopedPath, scopedCss);
              componentStyles.imports.push(scopedPath);
            }
            return '';
          },
        },
        (compilerOptions) => {
          return {
            ...compilerOptions,
            noEmitOnError: false,
            inlineSources: !!sourcemap,
            inlineSourceMap: !!sourcemap,
            sourceMap: undefined,
            mapRoot: undefined,
            sourceRoot: undefined,
            preserveSymlinks: false,
            // externalRuntimeStyles: pluginOptions.externalRuntimeStyles,
            // _enableHmr: !!pluginOptions.templateUpdates,
            // supportTestBed: !!pluginOptions.includeTestMetadata,
          };
        },
      );
      // shouldTsIgnoreJs = !initializationResult.compilerOptions.allowJs;
      // // Isolated modules option ensures safe non-TypeScript transpilation.
      // // Typescript printing support for sourcemaps is not yet integrated.
      // useTypeScriptTranspilation =
      //   !initializationResult.compilerOptions.isolatedModules ||
      //   !!initializationResult.compilerOptions.sourceMap ||
      //   !!initializationResult.compilerOptions.inlineSourceMap;
      // referencedFiles = initializationResult.referencedFiles;
      // externalStylesheets = initializationResult.externalStylesheets;
    } catch {}
    try {
      for (const {
        filename,
        contents,
      } of await compilation.emitAffectedFiles()) {
        typeScriptFileCache.set(path.normalize(filename), contents);
      }
    } catch {}
    const diagnostics = await compilation.diagnoseFiles(
      useTypeChecking
        ? DiagnosticModes.All
        : DiagnosticModes.All & ~DiagnosticModes.Semantic,
    );
    console.log(diagnostics);
    await compilation.close?.();
  });

  api.transform(
    {
      test: /\.[cm]?[jt]sx?$/,
    },
    async (context) => {
      const isJs = /\.[cm]?js$/.test(context.resourcePath);
      if (isJs) {
        const contents = await javascriptTransformer.transformData(
          context.resourcePath,
          context.code,
          false,
          false,
        );
        return {
          code: Buffer.from(contents).toString(),
        };
      }
      const content = typeScriptFileCache.get(context.resourcePath);
      if (!content) {
        throw new Error(`No compiled output found for ${context.resourcePath}`);
      }
      let code: string;
      if (typeof content === 'string') {
        code = content;
      } else {
        code = Buffer.from(content).toString();
      }
      const componentStyles = componentStylesCache.get(context.resourcePath);
      if (componentStyles) {
        const { imports } = componentStyles;
        let importsString = '';
        for (let i = 0; i < imports.length; ++i) {
          let relativeImport = path.relative(
            path.dirname(context.resourcePath),
            imports[i],
          );
          if (!relativeImport.startsWith('.')) {
            relativeImport = `./${relativeImport}`;
          }
          importsString += `import "${relativeImport}";`;
        }
        code = importsString + code;
      }
      const scopeInfo = componentScopeIds.get(context.resourcePath);
      if (scopeInfo) {
        code += `\n;${scopeInfo.className}.\u0275cmp.id = '${scopeInfo.scopeId}';\n`;
      }
      return {
        code,
      };
    },
  );
};

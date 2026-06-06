import { relative, resolve, join } from 'node:path';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const getUiSourceDir = (): string => {
  const cliDir = resolve(fileURLToPath(import.meta.url), '..', '..', '..');
  return resolve(cliDir, '..', 'ui', 'src', 'lib');
};

export const getComponentSourceDir = (componentName: string): string => {
  return join(getUiSourceDir(), 'components', componentName);
};

export const getComponentFiles = (componentName: string): string[] => {
  const dir = getComponentSourceDir(componentName);
  return readdirSync(dir).filter((f) => f.endsWith('.ts'));
};

export const rewriteImports = (
  fileContent: string,
  componentDestDir: string,
  utilsDir: string,
): string => {
  return fileContent.replace(
    /from\s+['"](\.\.\/.*)['"];?/g,
    (match, importPath: string) => {
      if (importPath.includes('utils/cn')) {
        const rel = relative(componentDestDir, utilsDir);
        const cnPath = join(rel, 'cn').replace(/\\/g, '/');
        return `from '${cnPath}';`;
      }
      return match;
    },
  );
};

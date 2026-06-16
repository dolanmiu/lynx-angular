import { resolve, join } from 'node:path';
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

export const rewriteImports = (fileContent: string): string => {
  return fileContent.replace(
    /from\s+['"]\.\.\/\.\.\/utils\/([^'"]+)['"];?/g,
    (_match, utilName: string) => {
      return `from '@blotch/dolan/utils/${utilName}';`;
    },
  );
};

import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vitest/config';

const checkVersionsPlugin = (): Plugin => {
  return {
    name: 'check-package-versions',
    buildStart() {
      const packages = [
        'packages/runtime',
        'packages/rsbuild-plugin-angular-lynx',
        'packages/testing-library',
      ];
      const versions = packages.map((p) => ({
        path: p,
        version: JSON.parse(readFileSync(`${p}/package.json`, 'utf-8')).version,
      }));
      const unique = new Set(versions.map((v) => v.version));
      if (unique.size !== 1) {
        const detail = versions
          .map((v) => `  ${v.path}: ${v.version}`)
          .join('\n');
        this.error(`Package version mismatch:\n${detail}`);
      }
    },
  };
}

export default defineConfig({
  plugins: [checkVersionsPlugin()],
  define: {
    __DEV__: false,
  },
  test: {
    include: ['packages/*/src/**/*.spec.ts'],
    exclude: ['packages/kitchen-sink-app/**'],
  },
});

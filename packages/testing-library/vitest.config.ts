import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  define: {
    // Angular compiler checks __DEV__ in some paths; match what the plugin sets.
    __DEV__: JSON.stringify(true),
    // Angular Lynx runs on the main thread in tests: LynxDocument uses PAPI.
    __MAIN_THREAD__: JSON.stringify(true),
  },
  test: {
    // jsdom provides the DOM APIs Angular platform-browser expects.
    // LynxTestingEnv is installed on top of jsdom in src/setup.ts.
    environment: 'jsdom',
    globals: true,
    setupFiles: [path.resolve(import.meta.dirname, 'src/setup.ts')],
    include: ['src/**/*.test.ts'],
    alias: [
      {
        find: '@blotch/angular-lynx',
        replacement: path.resolve(
          import.meta.dirname,
          '../runtime/src/public-api.ts',
        ),
      },
    ],
  },
});

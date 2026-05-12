import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['packages/*/src/**/*.spec.ts'],
    exclude: ['packages/kitchen-sink-app/**'],
  },
});

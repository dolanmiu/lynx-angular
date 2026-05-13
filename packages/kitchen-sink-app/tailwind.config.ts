import type { Config } from 'tailwindcss';
import preset from '@lynx-js/tailwind-preset';

const config: Config = {
  // Angular templates are TypeScript inline string literals — there are no .html files.
  // Tailwind v3 JIT scans file content as text and finds class="..." patterns in .ts files.
  content: ['./src/**/*.ts'],
  presets: [preset],
};

export default config;

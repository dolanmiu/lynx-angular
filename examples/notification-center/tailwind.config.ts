import type { Config } from 'tailwindcss';
import preset from '@lynx-js/tailwind-preset';
import { blotchPlugin } from '@blotch/ui/theme/tailwind-plugin';

const config: Config = {
  content: ['./src/**/*.ts'],
  presets: [preset],
  plugins: [blotchPlugin],
};

export default config;

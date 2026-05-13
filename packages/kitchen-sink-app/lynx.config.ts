import { pluginAngularLynx } from '@blotch/rsbuild-plugin-angular-lynx';
import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin';
import { defineConfig } from '@lynx-js/rspeedy';
import { pluginTailwindCSS } from 'rsbuild-plugin-tailwindcss';

export default defineConfig({
  source: {
    entry: './src/main.ts',
  },
  plugins: [
    pluginQRCode({
      schema(url) {
        // We use `?fullscreen=true` to open the page in LynxExplorer in full screen mode
        return `${url}?fullscreen=true`;
      },
    }),
    pluginAngularLynx(),
    pluginTailwindCSS({
      config: 'tailwind.config.ts',
      // Prevent Tailwind from scanning or transforming CSS in node_modules.
      exclude: [/[\\/]node_modules[\\/]/],
    }),
  ],
});

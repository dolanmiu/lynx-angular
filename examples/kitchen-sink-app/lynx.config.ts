import { pluginAngularLynx } from '@blotch/rsbuild-plugin-angular-lynx';
import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin';
import { defineConfig } from '@lynx-js/rspeedy';

export default defineConfig({
  // Build for both targets: `lynx` produces the native bundle, `web` the browser
  // preview bundle. `cleanDistPath: false` on web keeps the lynx bundle in place
  // when the two builds run sequentially (see the dual-environment build script).
  environments: {
    web: {
      output: { cleanDistPath: false },
    },
    lynx: {},
  },
  source: {
    entry: './src/main.ts',
  },
  output: {
    // Inline @font-face .ttf files as Base64 data URIs instead of emitting them
    // as separate asset files. Reason: a font referenced from CSS `url()` is
    // emitted with a `webpack:///static/font/…` path — a scheme the native Lynx
    // GenericResourceFetcher can't fetch (iOS reports NSURLErrorDomain -1002
    // "unsupported URL"). Unlike JS-imported assets (our images), CSS `url()`
    // references don't pick up the dev server's resolved http publicPath. Data
    // URIs travel inside the bundle, so the font needs no network fetch and no
    // publicPath resolution at all — exactly what the Lynx @font-face docs
    // recommend ("Base64-encoded fonts"). Only fonts are inlined; images and
    // other assets keep the default 2KB threshold.
    dataUriLimit: {
      font: Number.MAX_SAFE_INTEGER,
    },
  },
  plugins: [
    pluginQRCode({
      schema(url) {
        // We use `?fullscreen=true` to open the page in LynxExplorer in full screen mode
        return `${url}?fullscreen=true`;
      },
    }),
    pluginAngularLynx({ enableSSR: true }),
  ],
});

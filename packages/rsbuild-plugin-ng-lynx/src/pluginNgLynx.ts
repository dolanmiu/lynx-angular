import type { RsbuildPlugin } from '@lynx-js/rspeedy';
import { applyAngularRules } from './angular.js';
import { applyCSS } from './css.js';
import { applyEntry } from './entry.js';
import { applyGenerator } from './generator.js';
import { applyLayers } from './layers.js';
import { applySplitChunksRule } from './splitChunks.js';
import { normalizeOptions, type PluginNgLynxOptions } from './utils/options.js';

export function pluginNgLynx(options?: PluginNgLynxOptions): RsbuildPlugin {
  return {
    name: 'lynx:angular',
    pre: ['lynx:rsbuild:plugin-api'],
    setup: (api) => {
      const normalizedOptions = normalizeOptions(options);
      applyCSS(api, normalizedOptions);
      applyEntry(api, normalizedOptions);
      applyLayers(api);
      applyAngularRules(api);
      applyGenerator(api);
      applySplitChunksRule(api);
    },
  };
}

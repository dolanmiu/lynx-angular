// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { RuntimeGlobals as LynxRuntimeGlobals } from '@lynx-js/webpack-runtime-globals';
import type { RuntimeModule, rspack } from '@rspack/core';

type LynxProcessEvalResultRuntimeModule = new () => RuntimeModule;

export const createLynxProcessEvalResultRuntimeModule = (
  webpack: typeof rspack,
): LynxProcessEvalResultRuntimeModule => {
  return class LynxProcessEvalResultRuntimeModule
    extends webpack.RuntimeModule
  {
    constructor() {
      super('Lynx process eval result', webpack.RuntimeModule.STAGE_ATTACH);
    }

    override generate(): string {
      const chunk = this.chunk;
      const compilation = this.compilation;

      if (!chunk || !compilation) {
        return '';
      }

      const chunkGroup = chunk._groupsIterable?.[0];
      const modules = compilation.chunkGraph?.getChunkModules(chunk) ?? [];
      // Sort modules by pre-order traversal index so dependencies execute before dependents
      modules.sort((a, b) => {
        const aIdx = chunkGroup?.getModulePreOrderIndex(a) ?? 0;
        const bIdx = chunkGroup?.getModulePreOrderIndex(b) ?? 0;
        return aIdx - bIdx;
      });
      const sortedIds = modules
        .map((m) => compilation.chunkGraph.getModuleId(m))
        .filter((id) => id != null);
      const moduleOrder = JSON.stringify(sortedIds);

      return `
${LynxRuntimeGlobals.lynxProcessEvalResult} = function (result, schema) {
  var chunk = result && result(schema);
  if (chunk && chunk.ids && chunk.modules) {
    ${webpack.RuntimeGlobals.externalInstallChunk}(chunk);
    var moduleOrder = ${moduleOrder};
    for (var i = 0; i < moduleOrder.length; i++) {
      if (chunk.modules[moduleOrder[i]]) {
        ${webpack.RuntimeGlobals.require}(moduleOrder[i]);
      }
    }
    return chunk;
  }
  return chunk
}
`;
    }
  };
};

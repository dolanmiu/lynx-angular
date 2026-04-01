# TODO

## Runtime

- [x] Emulated view encapsulation (`ViewEncapsulation.Emulated`)
- [ ] `x-list` virtualization — `componentAtIndex` and `enqueueComponent` callbacks are stubs (`lynx-document.ts:67-93`)
- [ ] Background-thread `querySelector`/`querySelectorAll` — currently throw "not implemented" (`lynx-element.ts`)
- [ ] `__DEV__` and `__PROFILE__` globals — marked TODO in `runtime-types.ts`
- [ ] Comment node creation — TODO about whether it should be raw text (`lynx-document.ts:133`)
- [ ] `RendererStyleFlags2` flags ignored in `setStyle`/`removeStyle` (`renderer.ts:79,87`)
- [ ] Renderer `destroy()` is a no-op, `data` returns `{}` (`renderer.ts:13-15`)
- [ ] Debug `console.log`s should be gated behind `__DEV__`

## Build Plugin

- [ ] HMR and live reload
- [ ] JIT compilation support (`options.ts:132`)
- [ ] `?common` CSS query parameter (`css.ts:180`)
- [ ] `splitChunks.chunks: 'async'` support (`split-chunks.ts:59`)
- [ ] Sort with `preOrderIndex` (`lynx-process-eval-result-runtime-module.ts:32`)
- [ ] Handle missing `'use strict'` edge case (`angular-webpack-plugin.ts:166`)
- [ ] Use loader instead of BannerPlugin for injections (`angular-webpack-plugin.ts:173`)
- [ ] Replace LynxTemplatePlugin types with Rspack types (`angular-webpack-plugin.ts:258`)
- [ ] Better error on missing build config (`options.ts:117`)
- [ ] Compiler warnings for Lynx-specific issues

## Testing

- [ ] Background-thread element operations
- [ ] Event handling edge cases (touch events, propagation, catch semantics)
- [ ] Style flags (important, dash-case)
- [ ] List virtualization
- [ ] Error handling paths

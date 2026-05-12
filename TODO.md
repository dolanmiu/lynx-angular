# TODO

## Runtime

- [x] Emulated view encapsulation (`ViewEncapsulation.Emulated`)
- [x] `x-list` virtualization — `componentAtIndex`, `enqueueComponent`, and `componentAtIndexes` fully implemented (`create-list-element.ts`)
- [ ] Background-thread `querySelector`/`querySelectorAll` — currently throw "not implemented" (`lynx-background-element.ts`)
- [x] `__DEV__` and `__PROFILE__` globals — injected by `DefinePlugin` in `angular-webpack-plugin.ts`; stale TODO comments removed from `runtime-types.ts`
- [x] Comment node creation — uses `__CreateView` with `display: none` as anchor; invisible to native, participates in tree ops (`lynx-document.ts`)
- [x] `RendererStyleFlags2` flags — `DashCase` converts camelCase→dash-case; `Important` appends `!important` to value (`renderer.ts`)
- [x] Renderer `destroy()` is a no-op, `data` returns `{}` (`renderer.ts:13-15`)
- [x] Debug `console.log`s gated behind `__DEV__` (document constructor logs); `console.warn`s left ungated — they signal real issues

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

# TODO

## Runtime

- [x] Emulated view encapsulation (`ViewEncapsulation.Emulated`)
- [x] `x-list` virtualization — `componentAtIndex`, `enqueueComponent`, and `componentAtIndexes` fully implemented (`create-list-element.ts`)
- [x] Background-thread `querySelector`/`querySelectorAll` — DFS traversal with tag/class/id/attribute selector support (`lynx-background-element.ts`)
- [x] `__DEV__` and `__PROFILE__` globals — injected by `DefinePlugin` in `angular-webpack-plugin.ts`; stale TODO comments removed from `runtime-types.ts`
- [x] Comment node creation — uses `__CreateView` with `display: none` as anchor; invisible to native, participates in tree ops (`lynx-document.ts`)
- [x] `RendererStyleFlags2` flags — `DashCase` converts camelCase→dash-case; `Important` appends `!important` to value (`renderer.ts`)
- [x] Renderer `destroy()` is a no-op, `data` returns `{}` (`renderer.ts:13-15`)
- [x] Debug `console.log`s gated behind `__DEV__` (document constructor logs); `console.warn`s left ungated — they signal real issues

## Build Plugin

- [x] HMR and live reload — transport client + hot dev server entries use `prepend()` so they run before user code; entry files get `module.hot.accept()` injected so webpack applies hot updates in-place; `bootstrapApplication` is re-entrant (destroys previous app, re-creates with updated code). Angular's Vite-specific `_enableHmr` is not used — `ɵɵgetReplaceMetadataURL()` crashes in Lynx (`new URL` rejects `file://` base) and requires a `/@ng/component` virtual module server we don't have.
- [x] JIT compilation support — reads `aot` from angular.json build options (default `true`); passes through to `createAngularCompilation(false, aot)` and `JavaScriptTransformer({ jit: !aot })`
- [x] `?common` CSS query parameter (`css.ts:180`)
- [x] `splitChunks.chunks: 'async'` support (`split-chunks.ts:59`)
- [x] Sort with `preOrderIndex` (`lynx-process-eval-result-runtime-module.ts:32`)
- [x] Handle missing `'use strict'` edge case (`angular-webpack-plugin.ts:166`)
- [x] Use loader instead of BannerPlugin for injections (`thread-globals-loader.ts`)
- [x] Replace LynxTemplatePlugin types with Rspack types (`angular-webpack-plugin.ts:258`)
- [x] Better error on missing build config (`options.ts:117`)
- [x] Compiler warnings for Lynx-specific issues

## Platform Features

- [ ] Gesture system — React Lynx has full gesture support (TAP, LONG_PRESS, PAN, FLING, PINCH, ROTATION, COMPOSED) with worklet-based callbacks and composition (`waitFor`, `simultaneousWith`, `continueWith`). AngularLynx has no gesture abstraction.
- [ ] Main thread scripting (MTS) — `runOnMainThread()` / `runOnBackground()` for cross-thread execution. React Lynx supports worklet functions with element access from main thread. Currently no Angular equivalent.
- [ ] Exposure/visibility detection — Lynx supports `uiappear`/`uidisappear` events, `exposure`/`disexposure` global events, and the `IntersectionObserver` API. Need Angular directives or signals for visibility-driven logic.
- [ ] Pull-to-refresh — `<refresh>` element not implemented in the renderer
- [ ] ViewPager — `<viewpager>` element not implemented in the renderer
- [ ] Scroll coordinator — `<scroll-coordinator>` for synchronizing multiple scrollable containers not implemented
- [ ] Safe area / device adaptation — No helpers for notch/safe-area-aware layouts
- [ ] Dark mode — Lynx supports `:dark` pseudo-class; no Angular integration
- [ ] Native module bridge — `lynx.requireModule()` / `lynx.requireModuleAsync()` for calling platform-native APIs (Objective-C, Java/Kotlin, ETS). No typed Angular service wrapper.
- [ ] Session storage — `lynx.getSessionStorage()` / `lynx.setSessionStorage()` / `lynx.subscribeSessionStorage()` not surfaced as Angular injectable
- [ ] System info — `lynx.systemInfo` (device dimensions, OS, DPI) not exposed as Angular injectable
- [ ] Global event emitter — `lynx.GlobalEventEmitter` not wrapped for Angular consumption
- [ ] Custom fonts — `lynx.addFont()` not exposed
- [ ] Text measurement — `lynx.getTextInfo()` not exposed
- [ ] Resource prefetching — `lynx.requestResourcePrefetch()` / `lynx.cancelResourcePrefetch()` not exposed

## Accessibility

- [ ] `accessibility-element`, `accessibility-label`, `accessibility-trait` attribute support on Lynx element directives
- [ ] `accessibility-elements` (focus order), `accessibility-elements-hidden` (hide from a11y tree)
- [ ] `accessibilityAnnounce()` for dynamic screen reader announcements
- [ ] `requestAccessibilityFocus()` for programmatic focus

## Angular Feature Parity

- [ ] `NgComponentOutlet` — verify dynamic component rendering works on Lynx
- [ ] `ViewContainerRef.createComponent()` — verify programmatic component creation
- [ ] Content projection (`ng-content`, `@ContentChild`, `@ContentChildren`) — verify with Lynx elements
- [ ] Deferred views (`@defer`) — verify lazy-loaded template blocks work
- [ ] Error boundaries — React Lynx has `useErrorBoundary`; Angular needs an equivalent (ErrorHandler + component-level recovery)
- [ ] Lazy bundle loading — React Lynx has `loadLazyBundle()` for code-split components in lists; AngularLynx only has route-level lazy loading
- [ ] Suspense / loading states — no equivalent to React Suspense for async component loading
- [ ] Portal-like rendering — rendering into `<overlay>` from arbitrary component tree depth (like Angular CDK Portal)
- [ ] i18n — Angular's `$localize` / i18n extraction not tested or configured in the build plugin
- [ ] SSR / pre-rendering — `__ENABLE_SSR__` flag exists in build plugin but is not implemented
- [ ] Forms — `<input>` and `<textarea>` work at element level, but Angular forms (reactive & template-driven) need validation with Lynx events (`bindinput`, `bindfocus`, `bindblur`)

## Build Plugin

- [ ] HMR — currently disabled; Angular's `_enableHmr` crashes because `new URL()` rejects `file://` base and Lynx dev server lacks `/__angular_hmr/*` endpoints. Full page reload works as fallback.
- [ ] Lazy bundles (non-route) — `experimental_isLazyBundle` option exists but is untested; needed for list item code splitting
- [ ] Production optimizations — tree-shaking, dead code elimination, and bundle size analysis for Lynx targets
- [ ] Asset pipeline — font files, SVG sprites, and other static assets beyond images
- [ ] Multi-page / multi-entry — building multiple Lynx pages from one Angular workspace

## Developer Experience

- [ ] DevTools — component tree inspector, state viewer, event debugger for on-device debugging (currently only `<text>`-based debug output)
- [ ] Error overlay — surface build errors and runtime exceptions on-device instead of silent failures
- [ ] CLI schematics — `ng generate` support for Lynx components (with Lynx element templates instead of HTML)
- [ ] Documentation — API reference, migration guide from React Lynx, architecture deep-dive
- [ ] Starter template / `ng new` preset — scaffold a new AngularLynx project

## Testing

- [ ] Background-thread element operations
- [ ] Event handling edge cases (touch events, propagation, catch semantics)
- [ ] Style flags (important, dash-case)
- [ ] List virtualization
- [ ] Error handling paths
- [ ] Unit testing harness — `TestBed`-compatible test utilities for Lynx renderer (mock `__CreateElement`, `__AppendElement`, etc.)
- [ ] Component testing — render Angular components against the Lynx document and assert element tree structure
- [ ] E2E testing — on-device or emulator-based integration tests

## Performance

- [ ] Element pool monitoring — track native element allocation to detect pool exhaustion before it crashes
- [ ] List recycling optimization — profile `LynxListElement` update batching for large datasets
- [ ] Change detection profiling — measure `OnPush` vs default strategy impact in Lynx environment
- [ ] Bundle size budget — track and enforce size limits for main-thread and background-thread bundles

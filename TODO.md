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
- [x] Runtime polyfills — `AbortController`/`AbortSignal` (Angular Router v21+ navigation pipeline), `queueMicrotask` (zoneless CD effect scheduling, falls back to `Promise.resolve().then`), `runWorklet` global (dispatches Lynx worklet callbacks into the correct function scope) (`runtime.ts`)

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
- [x] CSS Modules — `.module.css` imports resolve to locally-scoped class name objects via rsbuild's built-in CSS Modules support; no extra configuration needed; documented with demo (`examples/css-modules/`, `docs/guide/css-modules.mdx`)

## Platform Features

- [x] Gesture system — React Lynx has full gesture support (TAP, LONG_PRESS, PAN, FLING, PINCH, ROTATION, COMPOSED) with worklet-based callbacks and composition (`waitFor`, `simultaneousWith`, `continueWith`). `LynxGestureDetector` directive + `TapGesture`, `PanGesture`, `LongPressGesture`, `FlingGesture`, `PinchGesture`, `RotationGesture`, `ComposedGesture` implemented (`packages/runtime/src/lib/gesture/`).
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
- [x] Global event emitter — `LynxGlobalPropsService` (signal-based `globalProps`) and `LynxInitDataService` (signal-based `initData`) wrap `GlobalEventEmitter` as Angular injectables; `registerDataProcessors()` transforms raw `InitData` before delivery; all exported in the public API (`docs/guide/data-flow.mdx`)
- [x] Animation system — `LynxAnimation` class provides `play()`, `pause()`, `cancel()` via `__ElementAnimate`; `element.animate(keyframes, options)` mirrors the Web Animations API; CSS `@keyframes` and `transition` work via standard CSS; documented with examples (`examples/animations/`, `docs/guide/animations.mdx`)
- [x] Custom fonts — CSS `@font-face` works via the rsbuild CSS pipeline (the standard Angular approach); `LynxFontService` wraps `lynx.addFont()` for dynamic runtime font loading (`packages/runtime/src/lib/font/`)
- [x] Text measurement — `LynxTextMeasureService` wraps `lynx.getTextInfo()` with typed options and px-unit conversion; only works with built-in platform fonts (`packages/runtime/src/lib/text-measure/`)
- [ ] Resource prefetching — `lynx.requestResourcePrefetch()` / `lynx.cancelResourcePrefetch()` not exposed

## Accessibility

- [x] `accessibility-element`, `accessibility-label`, `accessibility-trait` attribute support on Lynx element directives — declared as `@Input()` on `BaseLynxDirective` (`base.ts:40-44`)
- [x] `accessibility-elements` (focus order), `accessibility-elements-hidden` (hide from a11y tree) — declared as `@Input()` on `BaseLynxDirective` (`base.ts:78-84`)
- [ ] `accessibilityAnnounce()` for dynamic screen reader announcements
- [ ] `requestAccessibilityFocus()` for programmatic focus

## Angular Feature Parity

- [x] `NgComponentOutlet` — verified working; `<router-outlet />` and dynamic component rendering confirmed after `createComment()` fix (`investigations/routing.md`)
- [x] `ViewContainerRef.createComponent()` — verified working; creates and renders components dynamically on Lynx (`investigations/routing.md`)
- [ ] Content projection (`ng-content`, `@ContentChild`, `@ContentChildren`) — verify with Lynx elements
- [x] Deferred views (`@defer`) — lazy-loaded template blocks work; `@defer (when visible())` and timer-based conditions verified (`examples/defer/`)
- [x] Error boundaries — `LynxErrorHandler` implements Angular `ErrorHandler`, routes errors to `_ReportError` (errorCode 1101), sets `__lynxLastError` for on-device debugging (`packages/runtime/src/lib/error-handler/`)
- [x] Lazy bundle loading — `loadComponent()` routes currently work via `output.asyncChunks: false` (all code inlined into one bundle). True code-split lazy loading needs: re-enabling `asyncChunks`, packaging async chunks inside `.lynx.bundle` via `LynxTemplatePlugin`, and enabling `experimental_isLazyBundle`. Infrastructure is in place: `LynxChunkLoadingRuntimeModule` implemented (`lynx-chunk-loading-runtime-module.ts`), `asyncChunkName` hook re-enabled, background-thread exclusion removed (`LAZY_LOADING_PLAN.md`) - Won't do until Lynx fixes things upstream
- [ ] Suspense / loading states — no equivalent to React Suspense for async component loading
- [ ] Portal-like rendering — rendering into `<overlay>` from arbitrary component tree depth (like Angular CDK Portal)
- [ ] i18n — Angular's `$localize` / i18n extraction not tested or configured in the build plugin
- [ ] SSR / pre-rendering — `__ENABLE_SSR__` flag exists in build plugin but is not implemented
- [ ] Forms — `<input>` and `<textarea>` work at element level, but Angular forms (reactive & template-driven) need validation with Lynx events (`bindinput`, `bindfocus`, `bindblur`)

## Build Plugin

- [ ] HMR — currently disabled; Angular's `_enableHmr` crashes because `new URL()` rejects `file://` base and Lynx dev server lacks `/__angular_hmr/*` endpoints. Full page reload works as fallback.
- [ ] Lazy bundles (non-route) — `LynxChunkLoadingRuntimeModule` implemented and wired via `ensureChunkHandlers`; `asyncChunkName` hook re-enabled; `experimental_isLazyBundle: false` still gating `LynxTemplatePlugin` async chunk packaging; `output.asyncChunks: false` keeps everything inlined until the full pipeline is ready
- [ ] Production optimizations — tree-shaking, dead code elimination, and bundle size analysis for Lynx targets
- [ ] Asset pipeline — font files, SVG sprites, and other static assets beyond images
- [ ] Multi-page / multi-entry — building multiple Lynx pages from one Angular workspace

## Developer Experience

- [x] Remote logging (`LynxLoggerService`) — fetch-based log transport to the dev server; IPC bridge (`lynx.getJSContext().dispatchEvent`) relays main-thread logs (no `fetch` available there) to the background thread; `__DEV__` gated (zero production overhead); unit tested (`lynx-logger.service.spec.ts`); documented (`docs/guide/remote-logging.mdx`)
- [ ] DevTools — component tree inspector, state viewer, event debugger for on-device debugging (currently only `<text>`-based debug output)
- [ ] Error overlay — surface build errors and runtime exceptions on-device instead of silent failures
- [ ] CLI schematics — `ng generate` support for Lynx components (with Lynx element templates instead of HTML)
- [x] Documentation — 31 guide pages in `packages/website/docs/guide/` covering gestures, animations, defer, error-handling, forms, routing, CSS modules, testing, data-flow, signals, tailwindcss, and all elements
- [ ] Starter template / `ng new` preset — scaffold a new AngularLynx project

## Testing

- [x] Background-thread element operations — covered in `lynx-background-element.spec.ts` (addEventListener, event cleanup, tree operations)
- [x] Event handling edge cases (touch events, propagation, catch semantics) — `bindtap`, `catchtap`, `capture-bindtap` propagation/catch semantics tested in `lynx-element.spec.ts`
- [ ] Style flags (important, dash-case)
- [x] List virtualization — component-level tests in `list-example.component.spec.ts` cover item toggling, dynamic addition, and tap events via the testing library
- [ ] Error handling paths
- [x] Unit testing harness — `packages/testing-library/` provides `render()`, `cleanup()`, `waitForUpdate()`, `fireEvent()` with mocked `__CreateElement`, `__AppendElement`, etc.
- [x] Component testing — render Angular components against the Lynx document and assert element tree structure (covered in `render.test.ts`)
- [ ] E2E testing — on-device or emulator-based integration tests

## Performance

- [ ] Element pool monitoring — track native element allocation to detect pool exhaustion before it crashes
- [ ] List recycling optimization — profile `LynxListElement` update batching for large datasets
- [ ] Change detection profiling — measure `OnPush` vs default strategy impact in Lynx environment
- [ ] Bundle size budget — track and enforce size limits for main-thread and background-thread bundles

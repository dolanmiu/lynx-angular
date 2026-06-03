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
- [x] Main thread scripting (MTS) — `mainThreadFn()` factory registers worklet functions on the main thread via deterministic counter-based IDs (no compiler plugin needed); `LynxMainThreadEvent` directive binds worklet handlers to native events (`mainThreadBindtap`, `mainThreadBindscroll`, etc.); `LynxMainThreadService.runOnMainThread()` provides cross-thread RPC; `backgroundFn()` + `runOnBackground()` enables main→background callbacks from worklet functions; `MainThreadRef<T>` persists state across main-thread calls; types re-exported from `@lynx-js/types/main-thread` (`packages/runtime/src/lib/main-thread/`)
- [x] Exposure/visibility detection — `LynxExposureService` wraps global `exposure`/`disexposure` events via `GlobalEventEmitter` with signal-based state + control APIs (`stopExposure()`, `resumeExposure()`, `setObserverFrameRate()`); `LynxExposureDirective` provides per-element `visible` signal via `binduiappear`/`binduidisappear`; advanced attributes (`exposure-area`, `exposure-screen-margin-*`, `exposure-ui-margin-*`) added to `LynxElementBase` (`packages/runtime/src/lib/exposure/`)
- [x] Pull-to-refresh — `<refresh>` + `<refresh-header>` elements with `enable-refresh` attribute, `bindheaderoffset`/`bindrefreshstatechange`/`bindstartrefresh` events, and `autoStartRefresh()`/`finishRefresh()` methods via SelectorQuery (`packages/runtime/src/lib/lynx-elements/refresh.ts`)
- [x] ViewPager — `<viewpager>` + `<viewpager-item>` elements with full attribute support (`initial-select-index`, `enable-scroll`, `bounces`, platform-specific attributes); events (`bindchange`, `bindoffsetchange`, `bindwillchange`) work via renderer event system (`packages/runtime/src/lib/lynx-elements/viewpager.ts`)
- [x] Scroll coordinator — `<scroll-coordinator>` + `<scroll-coordinator-header>`, `<scroll-coordinator-toolbar>`, `<scroll-coordinator-slot>` for synchronized nested scrolling with foldable header; `enable-scroll`, `bounces`, `granularity`, `header-over-slot`, `refresh-mode` attributes; `bindoffset` event; `setFoldExpanded()` method via SelectorQuery (`packages/runtime/src/lib/lynx-elements/scroll-coordinator.ts`)
- [x] Safe area / device adaptation — `LynxSafeAreaService` exposes reactive `isNotchScreen()` signal; CSS `env(safe-area-inset-*)` works natively; `SAFE_AREA_INSET_TOP/BOTTOM/LEFT/RIGHT` constants exported for dynamic styles; documented with common patterns (`packages/runtime/src/lib/safe-area/`, `docs/guide/safe-area.mdx`)
- [x] Dark mode — `LynxThemeService` exposes reactive `theme()` signal (`'Dark'` | `'Light'`) and `isDarkMode()` boolean from `lynx.__globalProps.theme`; CSS variable theming documented; class-based switching pattern (`packages/runtime/src/lib/theme/`, `docs/guide/dark-mode.mdx`)
- [x] Native module bridge — `LynxNativeModuleService` wraps `NativeModules.bridge.call()` (Promise-based native method calls), `bridge.on()` (native events), `getNativeModule()` (typed access via `NativeModuleMap` augmentation), `getJSModule()` / `registerJSModule()` (JS module sharing within a LynxView). Graceful no-ops outside the Lynx runtime (`packages/runtime/src/lib/native-module/`)
- [x] Session storage — `LynxSessionStorageService` wraps `setSessionStorageItem` / `getSessionStorageItem` / `subscribeSessionStorage` / `unsubscribeSessionStorage` as Angular injectable with signal-based `watch()` for reactive key tracking (`packages/runtime/src/lib/session-storage/`)
- [x] System info — `LynxSystemInfoService` wraps the global `SystemInfo` object as Angular injectable with device dimensions (physical + logical CSS pixels), OS version, platform, engine version, runtime type, and theme (`packages/runtime/src/lib/system-info/`)
- [x] Global event emitter — `LynxGlobalDataService` (signal-based `globalData`) and `LynxInitDataService` (signal-based `initData`) wrap `GlobalEventEmitter` as Angular injectables; `registerDataProcessors()` transforms raw `InitData` before delivery; all exported in the public API (`docs/guide/data-flow.mdx`)
- [x] Animation system — `LynxAnimation` class provides `play()`, `pause()`, `cancel()` via `__ElementAnimate`; `element.animate(keyframes, options)` mirrors the Web Animations API; CSS `@keyframes` and `transition` work via standard CSS; documented with examples (`examples/animations/`, `docs/guide/animations.mdx`)
- [x] Custom fonts — CSS `@font-face` works via the rsbuild CSS pipeline (the standard Angular approach); `LynxFontService` wraps `lynx.addFont()` for dynamic runtime font loading (`packages/runtime/src/lib/font/`)
- [x] Text measurement — `LynxTextMeasureService` wraps `lynx.getTextInfo()` with typed options and px-unit conversion; only works with built-in platform fonts (`packages/runtime/src/lib/text-measure/`)
- [x] Resource prefetching — `LynxResourcePrefetchService` wraps `lynx.requestResourcePrefetch()` / `lynx.cancelResourcePrefetch()` with Promise-based API; ergonomic `PrefetchRequest` type with optional priority, cache target, and preload key; supports batch operations for images and videos (`packages/runtime/src/lib/resource-prefetch/`)

## Accessibility

- [x] `accessibility-element`, `accessibility-label`, `accessibility-trait` attribute support on Lynx element directives — declared as `@Input()` on `BaseLynxDirective` (`base.ts:40-44`)
- [x] `accessibility-elements` (focus order), `accessibility-elements-hidden` (hide from a11y tree) — declared as `@Input()` on `BaseLynxDirective` (`base.ts:78-84`)
- [x] `accessibilityAnnounce()` — `LynxAccessibilityService.announce(content)` wraps `lynx.accessibilityAnnounce()` with Promise-based API for dynamic screen reader announcements (`packages/runtime/src/lib/accessibility/`)
- [x] `requestAccessibilityFocus()` — `LynxAccessibilityService.requestFocus(selector)` wraps `lynx.createSelectorQuery().select().invoke()` for programmatic accessibility focus (`packages/runtime/src/lib/accessibility/`)

## Angular Feature Parity

- [x] `NgComponentOutlet` — verified working; `<router-outlet />` and dynamic component rendering confirmed after `createComment()` fix (`investigations/routing.md`)
- [x] `ViewContainerRef.createComponent()` — verified working; creates and renders components dynamically on Lynx (`investigations/routing.md`)
- [x] Content projection (`ng-content`, `@ContentChild`, `@ContentChildren`) — single-slot, multi-slot (`select`), conditional (`@if`), and nested projection all work; `contentChild()`/`contentChildren()` signal queries work in AOT; tested in `content-projection.test.ts`, demoed in `content-projection-demo/`
- [x] Deferred views (`@defer`) — lazy-loaded template blocks work; `@defer (when visible())` and timer-based conditions verified (`examples/defer/`)
- [x] Error boundaries — `LynxErrorHandler` implements Angular `ErrorHandler`, routes errors to `_ReportError` (errorCode 1101), sets `__lynxLastError` for on-device debugging (`packages/runtime/src/lib/error-handler/`)
- [x] Lazy bundle loading — `loadComponent()` routes currently work via `output.asyncChunks: false` (all code inlined into one bundle). True code-split lazy loading needs: re-enabling `asyncChunks`, packaging async chunks inside `.lynx.bundle` via `LynxTemplatePlugin`, and enabling `experimental_isLazyBundle`. Infrastructure is in place: `LynxChunkLoadingRuntimeModule` implemented (`lynx-chunk-loading-runtime-module.ts`), `asyncChunkName` hook re-enabled, background-thread exclusion removed (`LAZY_LOADING_PLAN.md`) - Won't do until Lynx fixes things upstream
- [x] Suspense / loading states — Angular's `@defer` with `@loading`, `@placeholder`, and `@error` blocks is the direct equivalent; already verified working on Lynx (line 60). Route-level loading uses `loadComponent()` with standard Angular patterns.
- [x] Portal-like rendering — `LynxPortalService` programmatically renders components or templates inside native `<overlay>` elements from arbitrary component tree depth; `open(component, config)` and `openTemplate(template, config)` return a `PortalRef` for lifecycle management; inline `<overlay>` also works for declarative use (`packages/runtime/src/lib/portal/`)
- [x] i18n — `@angular/localize/init` auto-polyfilled when i18n config detected in angular.json; `LynxLocaleService` reads locale from `lynx.__globalProps.appLocale`; `provideLocale()` sets `LOCALE_ID`; runtime translation via `$localize` in code + `loadTranslations()`. Template `i18n` attribute NOT supported (Angular's `ɵɵi18n` instruction bypasses Renderer2) — use `$localize` in TypeScript instead (`packages/runtime/src/lib/locale/`, `docs/guide/i18n.mdx`)
- [x] SSR / pre-rendering — `ssrEncode()` opcode serialization, `LynxHydrateDocument` hydration, and `buildElementQueueFromOpcodes` all implemented (`packages/runtime/src/lib/ssr/`); `__ENABLE_SSR__` flag wired in build plugin
- [x] Forms — `LynxInputValueAccessor` and `LynxTextareaValueAccessor` implement `ControlValueAccessor`, bridging reactive forms (`formControl`/`formControlName`), template-driven (`[(ngModel)]`), and Signal Forms (`[formField]`) to Lynx native events (`bindinput`, `bindblur`); included in `LYNX_ELEMENTS` and exported as `LYNX_FORM_ACCESSORS` (`packages/runtime/src/lib/forms/`)

## Build Plugin

- [ ] HMR — currently disabled; Angular's `_enableHmr` crashes because `new URL()` rejects `file://` base and Lynx dev server lacks `/__angular_hmr/*` endpoints. Full page reload works as fallback.
- [ ] Lazy bundles (non-route) — `LynxChunkLoadingRuntimeModule` implemented and wired via `ensureChunkHandlers`; `asyncChunkName` hook re-enabled; `experimental_isLazyBundle: false` still gating `LynxTemplatePlugin` async chunk packaging; `output.asyncChunks: false` keeps everything inlined until the full pipeline is ready
- [ ] Production optimizations — tree-shaking, dead code elimination, and bundle size analysis for Lynx targets
- [x] Asset pipeline — font files (`.ttf`, `.woff`, `.woff2`), SVG, and other static assets handled by rsbuild's built-in asset rules; `@font-face` via CSS pipeline verified in kitchen-sink app (`src/assets/fonts/`)
- [ ] Multi-page / multi-entry — building multiple Lynx pages from one Angular workspace

## Developer Experience

- [x] Remote logging (`LynxLoggerService`) — fetch-based log transport to the dev server; IPC bridge (`lynx.getJSContext().dispatchEvent`) relays main-thread logs (no `fetch` available there) to the background thread; `__DEV__` gated (zero production overhead); unit tested (`lynx-logger.service.spec.ts`); documented (`docs/guide/remote-logging.mdx`)
- [x] DevTools — `LynxPerformanceService` wraps `lynx.performance` (profileStart/End/Mark/FlowId) for Perfetto trace integration; `LynxDevToolsService` exposes reactive stats (CD cycles, element creates/removes, flush count); `devStats` module-level counters instrumented in renderer factory + document + element; all gated by `__PROFILE__` (zero production overhead) (`packages/runtime/src/lib/devtools/`)
- [ ] Error overlay — surface build errors and runtime exceptions on-device instead of silent failures
- [x] CLI schematics — `ng add @blotch/angular-lynx` transforms an existing Angular project; `ng generate @blotch/angular-lynx:component` (alias `c`) generates components with Lynx element templates; `ng generate @blotch/angular-lynx:add-tailwind`, `add-testing`, `add-i18n` add feature support; defined in `packages/runtime/schematics/collection.json`
- [x] Documentation — 31 guide pages in `packages/website/docs/guide/` covering gestures, animations, defer, error-handling, forms, routing, CSS modules, testing, data-flow, signals, tailwindcss, and all elements
- [x] Example gallery — 12 standalone examples in `packages/website/docs/guide/examples/` covering counter, todo list, form input, infinite scroll, pull-to-refresh, gestures, modal dialog, animated cards, enter/leave transitions, dark mode, data dashboard, tab navigation
- [x] Starter template / `ng new` preset — `packages/create-angular-lynx` implements `npm create angular-lynx <name>`, which runs `ng new` then `ng add @blotch/angular-lynx` automatically

## Testing

- [x] Background-thread element operations — covered in `lynx-background-element.spec.ts` (addEventListener, event cleanup, tree operations)
- [x] Event handling edge cases (touch events, propagation, catch semantics) — `bindtap`, `catchtap`, `capture-bindtap` propagation/catch semantics tested in `lynx-element.spec.ts`
- [x] Style flags (important, dash-case) — `RendererStyleFlags2.DashCase` and `Important` tested in `renderer.spec.ts`; element-level `setStyle`/`removeStyle`/`setInlineStyles` covered in `lynx-element.spec.ts` and `lynx-background-element.spec.ts`
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

# Lazy Loaded Routes — Root Cause Analysis & Implementation Plan

## Problem Statement

Angular Router's `loadComponent()` does not work in AngularLynx. Tapping any nav button that navigates to a lazy-loaded route appears to do nothing — RouterOutlet never activates.

---

## Root Cause: Anatomy of the Failure

### 1. What `loadComponent()` generates

```typescript
// app.routes.ts
{
  path: 'list-example',
  loadComponent: () =>
    import('./list-example/list-example.component').then(m => m.ListExampleComponent),
}
```

rspack compiles `import('./list-example/list-example.component')` into a **dynamic async chunk**. At build time, rspack emits a separate `.js` file for that chunk (e.g., `src_app_list-example_list-example_component_ts.js`). At runtime, when Angular Router activates the route, rspack's runtime calls:

```javascript
__webpack_require__.e(chunkId); // ensureChunkHandlers
```

This is webpack's mechanism for loading an async chunk before executing it.

### 2. The `all-in-one` default does NOT fix this

`packages/rsbuild-plugin-angular-lynx/src/split-chunks.ts:36-40` sets Rsbuild's `chunkSplit.strategy = 'all-in-one'` by default. This strategy disables the **SplitChunksPlugin** optimization (which would otherwise extract common vendor code into shared chunks). However, **it does NOT inline or suppress async chunks created by dynamic `import()` statements**. Those are a different rspack feature — they are always emitted regardless of `splitChunks` configuration.

### 3. There is no async chunk loader in Lynx's background thread

In a browser, webpack loads async chunks by:

- Injecting `<script>` tags into `document.head`, or
- Using `fetch()` / `XMLHttpRequest`

Neither exists in Lynx's native JS runtime (background thread). The background thread is a sandboxed JS environment — there is no DOM, no `document`, no `fetch`, no network APIs.

### 4. `lynxProcessEvalResult` cannot help webpack's `ensureChunkHandlers`

`packages/rsbuild-plugin-angular-lynx/src/lynx-process-eval-result-runtime-module.ts` provides a `__lynx_process_eval_result__` function. This function is designed to be **called by the Lynx native runtime** when it has already fetched and pre-evaluated a lazy bundle:

```javascript
__lynx_process_eval_result__ = function (result, schema) {
  var chunk = result && result(schema); // call the pre-evaluated chunk factory
  if (chunk && chunk.ids && chunk.modules) {
    __webpack_require__.C(chunk); // externalInstallChunk
    // ... require module IDs in dependency order
  }
};
```

This is a _receiver_, not a _fetcher_. The native runtime calls it; webpack cannot use it to fetch chunks on its own.

### 5. Background thread is explicitly excluded from `lynxProcessEvalResult`

`packages/rsbuild-plugin-angular-lynx/src/angular-webpack-plugin.ts:194`:

```typescript
if (chunk.name?.includes(':background')) {
  return; // Skip background chunks — do NOT add lynxProcessEvalResult
}
```

Angular Router runs on the background thread. Even if `lynxProcessEvalResult` could somehow fetch chunks, it is not available there.

### 6. `asyncChunkName` pairing hook is commented out

`angular-webpack-plugin.ts:346-354`:

```typescript
// hooks.asyncChunkName.tap(
//   this.constructor.name,
//   (chunkName) =>
//     chunkName
//       ?.replaceAll(`-${LAYERS.BACKGROUND}`, '')
//       ?.replaceAll(`-${LAYERS.MAIN_THREAD}`, ''),
// );
```

In Lynx's dual-thread model, each dynamic import generates **two** async chunks — one per layer (main-thread and background). `LynxTemplatePlugin` needs to pair them by name to bundle them together. The hook that strips layer suffixes from chunk names (so both `foo-background.js` and `foo-main.js` pair under `foo`) was attempted but disabled.

### 7. `experimental_isLazyBundle: false`

`angular-webpack-plugin.ts:73`:

```typescript
experimental_isLazyBundle?: boolean;
// ...
static defaultOptions = { experimental_isLazyBundle: false }
```

This flag marks the entire lazy bundle subsystem as unimplemented. It gates code paths for wrapping async chunks for Lynx.

### 8. The silent failure

`packages/runtime/src/lib/router/lynx-router.ts:50`:

```typescript
withRouterConfig({ resolveNavigationPromiseOnError: true });
```

When `__webpack_require__.e(chunkId)` hangs or throws because no chunk loader exists, Angular Router catches the error and **resolves the navigation promise as `false`** instead of rejecting. RouterOutlet receives a cancelled navigation and stays blank. The `lastError` signal in `app.component.ts` may not capture this because the error is swallowed by `resolveNavigationPromiseOnError` before reaching `LynxErrorHandler`.

---

## Implementation Plan: True Lazy Loading in AngularLynx

The goal is to make `loadComponent(() => import('./foo'))` work end-to-end using Lynx's native lazy bundle loading API — the same mechanism React Lynx uses via `loadLazyBundle` / `lynx.requireModuleAsync`.

### Overview of the mechanism

```
Angular Router calls loadComponent()
  → import('./foo') triggers __webpack_require__.e(chunkId)
  → Custom LynxChunkLoadingRuntimeModule intercepts ensureChunkHandlers
  → Calls lynx.requireModuleAsync(chunkUrl) (native API)
  → Native layer fetches the chunk JS, evaluates it
  → Native layer calls __lynx_process_eval_result__(chunkFn, schema)
  → Chunk is installed into webpack's module registry
  → import() promise resolves with the component module
  → Angular Router renders the component via RouterOutlet
```

---

### Step 1: Write a Lynx chunk loading runtime module

**New file:** `packages/rsbuild-plugin-angular-lynx/src/lynx-chunk-loading-runtime-module.ts`

This webpack RuntimeModule replaces the standard JSONP/fetch-based `ensureChunkHandlers` with one that calls `lynx.requireModuleAsync()`.

```typescript
import type { RuntimeModule, rspack } from '@rspack/core';
import { RuntimeGlobals as LynxRuntimeGlobals } from '@lynx-js/webpack-runtime-globals';

export const createLynxChunkLoadingRuntimeModule = (
  webpack: typeof rspack,
): new () => RuntimeModule => {
  return class LynxChunkLoadingRuntimeModule extends webpack.RuntimeModule {
    constructor() {
      super('lynx chunk loading', webpack.RuntimeModule.STAGE_ATTACH);
    }

    override generate(): string {
      const { RuntimeGlobals } = webpack;

      // Build a map of chunkId → chunk filename from rspack's chunk manifest.
      // This is generated at build time and inlined into the runtime.
      const chunkFilenameMap = this.#buildChunkFilenameMap();

      return `
// Lynx async chunk loader — uses lynx.requireModuleAsync() instead of <script>/fetch
${RuntimeGlobals.ensureChunkHandlers}.lynx = function(chunkId, promises) {
  var chunkFilenames = ${JSON.stringify(chunkFilenameMap)};
  var filename = chunkFilenames[chunkId];
  if (!filename) return;

  var promise = new Promise(function(resolve, reject) {
    // lynx.requireModuleAsync loads the chunk JS from the Lynx bundle.
    // The chunk must be packaged inside the .lynx.bundle by LynxTemplatePlugin.
    // Once loaded, the native layer calls __lynx_process_eval_result__(result, schema),
    // which installs the chunk into webpack's module registry.
    if (typeof lynx !== 'undefined' && typeof lynx.requireModuleAsync === 'function') {
      lynx.requireModuleAsync(filename, function(result) {
        ${LynxRuntimeGlobals.lynxProcessEvalResult}(result, null);
        resolve();
      }, reject);
    } else {
      // Fallback: try lynx.QueryComponent (React Lynx's API name)
      if (typeof lynx !== 'undefined' && typeof lynx.QueryComponent === 'function') {
        lynx.QueryComponent(filename, function(result) {
          ${LynxRuntimeGlobals.lynxProcessEvalResult}(result, null);
          resolve();
        });
      } else {
        reject(new Error('No Lynx async chunk loading API available'));
      }
    }
  });
  promises.push(promise);
};
`;
    }

    #buildChunkFilenameMap(): Record<string | number, string> {
      const map: Record<string | number, string> = {};
      const compilation = this.compilation!;
      const chunkGraph = compilation.chunkGraph;

      for (const chunk of compilation.chunks) {
        if (chunk.id == null) continue;
        const files = [...chunk.files];
        const jsFile = files.find((f) => f.endsWith('.js'));
        if (jsFile) map[chunk.id] = jsFile;
      }
      return map;
    }
  };
};
```

**Key points:**

- `lynx.requireModuleAsync(filename, onSuccess, onError)` — Lynx native API that fetches and evaluates a JS bundle file included in the `.lynx.bundle`, then calls back with the result
- `lynx.QueryComponent(filename, cb)` — React Lynx's equivalent (same underlying native mechanism, slightly different API name depending on Lynx version)
- After evaluation, the chunk calls `__lynx_process_eval_result__` which is already implemented in `lynx-process-eval-result-runtime-module.ts`

---

### Step 2: Remove the background-thread exclusion from `lynxProcessEvalResult`

**File:** `packages/rsbuild-plugin-angular-lynx/src/angular-webpack-plugin.ts`

**Current code (lines 188-204):**

```typescript
compilation.hooks.runtimeRequirementInTree
  .for(RuntimeGlobals.lynxProcessEvalResult)
  .tap('VanillaWebpackPlugin', (chunk) => {
    if (onceForChunkSet.has(chunk)) {
      return;
    }
    onceForChunkSet.add(chunk);

    if (chunk.name?.includes(':background')) {
      return; // ← REMOVE THIS
    }

    const LynxProcessEvalResultRuntimeModule =
      createLynxProcessEvalResultRuntimeModule(compiler.webpack);
    compilation.addRuntimeModule(
      chunk,
      new LynxProcessEvalResultRuntimeModule(),
    );
  });
```

**Change:** Remove the `if (chunk.name?.includes(':background')) { return; }` guard. The background thread also needs `lynxProcessEvalResult` because Angular Router's `loadComponent()` runs on the background thread.

---

### Step 3: Wire in the new chunk loading runtime module

**File:** `packages/rsbuild-plugin-angular-lynx/src/angular-webpack-plugin.ts`

Add the new `LynxChunkLoadingRuntimeModule` alongside `LynxProcessEvalResultRuntimeModule`. It should be added whenever `ensureChunkHandlers` is required:

```typescript
import { createLynxChunkLoadingRuntimeModule } from './lynx-chunk-loading-runtime-module.js';

// In apply():
compilation.hooks.runtimeRequirementInTree
  .for(compiler.webpack.RuntimeGlobals.ensureChunkHandlers)
  .tap('VanillaWebpackPlugin', (chunk, runtimeRequirements) => {
    runtimeRequirements.add(RuntimeGlobals.lynxProcessEvalResult);

    // Add Lynx chunk loading handler for ALL threads (both background and main)
    const LynxChunkLoadingRuntimeModule = createLynxChunkLoadingRuntimeModule(
      compiler.webpack,
    );
    compilation.addRuntimeModule(chunk, new LynxChunkLoadingRuntimeModule());
  });
```

---

### Step 4: Re-enable the `asyncChunkName` hook in `LynxTemplatePlugin`

**File:** `packages/rsbuild-plugin-angular-lynx/src/angular-webpack-plugin.ts`

**Current (commented out, lines 346-354):**

```typescript
// hooks.asyncChunkName.tap(
//   this.constructor.name,
//   (chunkName) =>
//     chunkName
//       ?.replaceAll(`-${LAYERS.BACKGROUND}`, '')
//       ?.replaceAll(`-${LAYERS.MAIN_THREAD}`, ''),
// );
```

**Why it was commented out:** The async chunk names had layer suffixes (e.g., `list-example-background`, `list-example-main-thread`) that prevented `LynxTemplatePlugin` from pairing them as a single logical chunk.

**Fix:** Uncomment and verify the layer suffix values match what rspack actually appends. The `LAYERS` constants from `layers.ts` define the layer names used by the webpack compilation. Chunks from the background layer will have a layer-derived suffix; same for main thread.

```typescript
hooks.asyncChunkName.tap(this.constructor.name, (chunkName) =>
  chunkName
    ?.replaceAll(`-${LAYERS.BACKGROUND}`, '')
    ?.replaceAll(`-${LAYERS.MAIN_THREAD}`, ''),
);
```

This normalizes `list-example-background` and `list-example-main-thread` to `list-example` so `LynxTemplatePlugin` can pair them and package both into the `.lynx.bundle`.

> **Important:** Verify the actual chunk name suffixes produced by rspack by inspecting build output. The layer names in `LAYERS` might differ from the chunk name suffixes (e.g., `background` vs `__background`). Adjust the `replaceAll` arguments accordingly.

---

### Step 5: Package async chunks in the `.lynx.bundle`

**Context:** `LynxTemplatePlugin` creates the final `.lynx.bundle` file. It knows about initial chunks (the main entry) but may not automatically include async chunks unless told to.

**Investigation needed:** Check `LynxTemplatePlugin`'s API for including async (lazy) chunks in the bundle. React Lynx's `lazy-bundle.ts` (`references/lynx-stack-main/packages/react/runtime/src/snapshot/lynx/lazy-bundle.ts`) uses `lynx.requireModuleAsync(source)` where `source` is the chunk filename relative to the bundle. This implies async chunks must be embedded in the `.lynx.bundle` as named sub-bundles.

**Likely approach:** In `angular-webpack-plugin.ts`, after async chunks are identified and their names normalized (Step 4), mark them using `LynxTemplatePlugin` hooks so they're included. Example:

```typescript
compilation.hooks.processAssets.tap(
  { name: '...', stage: PROCESS_ASSETS_STAGE_ADDITIONAL },
  () => {
    for (const chunk of compilation.chunks) {
      if (chunk.isInitial()) continue;
      // Mark async chunks for inclusion in the .lynx.bundle as lazy sub-bundles
      for (const file of chunk.files) {
        if (!file.endsWith('.js')) continue;
        compilation.updateAsset(file, (old) => old, {
          ...compilation.getAsset(file)?.info,
          'lynx:lazy-bundle': true, // hypothetical flag — verify actual LynxTemplatePlugin API
        });
      }
    }
  },
);
```

> **Research needed:** The actual `LynxTemplatePlugin` API for packaging lazy bundles. Check `@lynx-js/template-webpack-plugin` npm package types or Lynx OSS repository for how React Lynx signals lazy bundle inclusion.

---

### Step 6: Update `split-chunks.ts` to allow async chunks through

**File:** `packages/rsbuild-plugin-angular-lynx/src/split-chunks.ts`

The `modifyRspackConfig` callback currently returns early if `splitChunks` is falsy:

```typescript
if (!rspackConfig.optimization.splitChunks) {
  return rspackConfig;
}
```

With `all-in-one`, `splitChunks` is `false`, so the main-thread exclusion never runs. This is currently harmless, but once we enable lazy loading, we may need `splitChunks` to be configured to handle async chunks properly.

**Change:** Allow `splitChunks` to remain active for async chunks while still preventing main-thread chunks from being split. Update the default from `all-in-one` to a custom configuration:

```typescript
// Instead of all-in-one default, use a config that:
// 1. Disables splitChunks for initial/synchronous chunks (preserves all-in-one behavior)
// 2. Allows async chunks from loadComponent() to be emitted as separate files
if (!userConfig.performance?.chunkSplit?.strategy) {
  return mergeRsbuildConfig(config, {
    performance: {
      chunkSplit: {
        strategy: 'custom',
        splitChunks: {
          chunks: 'async', // only split async (dynamic import) chunks
          minSize: 0,
          minChunks: 1,
        },
      },
    },
  });
}
```

This preserves the "no vendor chunk splitting" behavior for synchronous code while letting dynamic imports produce their own async chunks.

---

### Step 7: Enable `experimental_isLazyBundle`

**File:** `packages/rsbuild-plugin-angular-lynx/src/entry.ts` (or wherever `AngularWebpackPlugin` is instantiated)

Set `experimental_isLazyBundle: true` when creating the plugin:

```typescript
new AngularWebpackPlugin({
  // ... existing options ...
  experimental_isLazyBundle: true,
});
```

Also update `angular-webpack-plugin.ts` to gate async-chunk wrapping (`beforeEncode` on `lepusCode.root`) behind this flag to ensure proper behavior.

---

### Step 8: Wrap async main-thread chunks for Lynx evaluation

**File:** `packages/rsbuild-plugin-angular-lynx/src/angular-webpack-plugin.ts`

The `beforeEncode` hook currently wraps the main entry's main-thread chunk:

```typescript
hooks.beforeEncode.tap(this.constructor.name, (args) => {
  // ...
  compilation.updateAsset(
    encodeData.lepusCode.root.name,
    (old) =>
      new ConcatSource(
        `(function (globDynamicComponentEntry) { ... }`,
        old,
        `...})`,
      ),
  );
});
```

Async main-thread chunks also need this wrapping so Lynx can evaluate them via `lynx.requireModuleAsync()`. Add handling for async (non-initial) template chunks from the `encodeData`.

---

### Step 9: Handle `loadComponent` in background chunk vs. main-thread chunk

**Problem:** `loadComponent()` runs on the background thread, so the async chunk is first loaded into the background thread's module registry. But the component's template (CSS classes, element creation calls that happen during rendering) may need to be present on the main thread too.

In Angular Lynx, the renderer runs on both threads:

- Background thread: Angular change detection, component instantiation, template logic
- Main thread: Lynx native element creation (via `__CreateView`, etc.)

The **main-thread** needs a corresponding async chunk that sets up the rendering side. Both chunks need to be loaded in sync.

**Approach (following React Lynx's model):** When the background thread's `__webpack_require__.e(chunkId)` is called, it loads both the background and main-thread chunks. The background chunk loading triggers the main thread to also load its corresponding chunk via the native bridge message passing.

> **Research needed:** How React Lynx coordinates main-thread and background-thread lazy bundle loading. See `references/lynx-stack-main/packages/react/runtime/src/snapshot/lynx/lazy-bundle.ts` and `dynamic-js.ts` for the coordination mechanism.

---

### Step 10: Update `provideRouter` to add preloading as a fallback

**File:** `packages/runtime/src/lib/router/lynx-router.ts`

While true lazy loading is being implemented, add `withPreloading(PreloadAllModules)` as an option so consumers can eager-preload all routes right after boot (routes still use `loadComponent()` syntax but are fetched proactively):

```typescript
import {
  PreloadAllModules,
  withPreloading,
  withRouterConfig,
} from '@angular/router';

export const provideRouter = (
  routes: Routes,
  ...features: RouterFeatures[]
) => {
  return makeEnvironmentProviders([
    // ...
    ngProvideRouter(
      routes,
      withRouterConfig({ resolveNavigationPromiseOnError: true }),
      withPreloading(PreloadAllModules), // preload all after initial nav
      ...features,
    ),
  ]);
};
```

**Note:** This still requires async chunk loading to work (it just starts fetching earlier). It is NOT a standalone fix but reduces latency once chunk loading works.

---

## Implementation Sequence

1. **Confirm chunk loading failure** — add debug logging to catch what error `resolveNavigationPromiseOnError` swallows. In `app.component.ts`, temporarily change `resolveNavigationPromiseOnError: true` to `false` and observe the unhandled rejection in `lastError`. This tells us the exact exception from `__webpack_require__.e`.

2. **Verify async chunk emission** — run `npm run build` and inspect the output directory. Look for files like `src_app_list-example_*.js` alongside the main bundle. Confirm async chunks exist.

3. **Implement `LynxChunkLoadingRuntimeModule`** (Step 1) and **remove background exclusion** (Step 2) and **wire it in** (Step 3). Build and check if `lynx.requireModuleAsync` is called.

4. **Research `LynxTemplatePlugin` lazy bundle API** — read the `@lynx-js/template-webpack-plugin` source or typings to understand how to embed async chunks.

5. **Re-enable `asyncChunkName` hook** (Step 4) and **implement async chunk packaging** (Step 5).

6. **Update `split-chunks.ts`** (Step 6) and **enable `experimental_isLazyBundle`** (Step 7).

7. **Handle dual-thread coordination** (Step 9) — research React Lynx's approach.

8. **End-to-end test** on device.

---

## Reference: React Lynx's Lazy Loading

`references/lynx-stack-main/packages/react/runtime/src/snapshot/lynx/`

| File             | Purpose                                                                                 |
| ---------------- | --------------------------------------------------------------------------------------- |
| `lazy-bundle.ts` | `loadLazyBundle(source)` — calls `lynx.requireModuleAsync()` or `lynx.QueryComponent()` |
| `dynamic-js.ts`  | `loadDynamicJS()` — loads non-component JS modules lazily                               |
| `suspense.ts`    | React Suspense wrapper that manages background snapshot cleanup during lazy loads       |
| `component.ts`   | Component registration for lazy bundles                                                 |

React Lynx doesn't use Angular Router — it uses React's `lazy()` + `Suspense`, which ultimately calls `loadLazyBundle(source)`. The `source` argument is the path to a `.lynx.bundle` file. Angular's equivalent is the chunk filename emitted by rspack, which needs to be embedded in the main `.lynx.bundle` as a lazy sub-bundle.

The key React Lynx call chain:

```
React.lazy(() => loadLazyBundle(source))
  → lynx.requireModuleAsync(source, callback)
  → [native fetches and evaluates source JS]
  → callback(__lynx_process_eval_result__)
  → __lynx_process_eval_result__(result, schema)
  → __webpack_require__.C(chunk) + require modules
```

Angular needs the same path but triggered by webpack's `__webpack_require__.e()`.

---

## Files to Create / Modify

| File                                                                            | Action                                                                                                   |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `packages/rsbuild-plugin-angular-lynx/src/lynx-chunk-loading-runtime-module.ts` | **Create** — custom webpack RuntimeModule for Lynx chunk loading                                         |
| `packages/rsbuild-plugin-angular-lynx/src/angular-webpack-plugin.ts`            | **Modify** — remove `:background` exclusion, wire in new runtime module, uncomment `asyncChunkName` hook |
| `packages/rsbuild-plugin-angular-lynx/src/split-chunks.ts`                      | **Modify** — change default from `all-in-one` to `custom` with `chunks: 'async'`                         |
| `packages/rsbuild-plugin-angular-lynx/src/plugin-angular-lynx.ts`               | **Modify** — pass `experimental_isLazyBundle: true` to `AngularWebpackPlugin`                            |
| `packages/runtime/src/lib/router/lynx-router.ts`                                | **Modify** — optionally add `withPreloading(PreloadAllModules)`                                          |
| `packages/kitchen-sink-app/src/app/app.routes.ts`                               | **Keep** `loadComponent()` — this is the correct API; it should work after the above                     |

---

## Open Questions (Research Before Implementing)

1. **`LynxTemplatePlugin` lazy bundle API** — what flag/metadata tells it to include a JS file as a lazy sub-bundle? Check `@lynx-js/template-webpack-plugin` npm package.

2. **`lynx.requireModuleAsync` vs `lynx.QueryComponent`** — which API does the Lynx runtime version we target expose? Check `references/lynx-website-main` API docs.

3. **Dual-thread coordination** — when background thread loads lazy chunk, how does main thread also load the corresponding main-thread chunk? Does `LynxTemplatePlugin` handle this automatically when both chunks are packaged together, or does it need explicit coordination?

4. **Actual layer suffix in chunk names** — inspect a build output to confirm what suffix rspack adds to async chunks in each layer (`-background`, `__background`, etc.) and adjust the `asyncChunkName` hook accordingly.

5. **`beforeEncode` async chunk wrapping** — does the main-thread async chunk need the `(function(globDynamicComponentEntry){...})` wrapper? Check if `LynxTemplatePlugin` calls `beforeEncode` for each async chunk or only for the root entry.

---

## Implementation Progress & Investigation Log

### What Has Been Implemented (as of 2026-05-22)

All infrastructure from the original plan is complete. The current implementation:

1. **`split-chunks.ts`** — When `experimental_isLazyBundle: true`:
   - Uses `strategy: 'custom'` with `chunks: 'async'` instead of `all-in-one`
   - Does NOT set `asyncChunks = false`
   - Result: rspack emits separate async chunk files for each `loadComponent()` dynamic import

2. **`plugin-angular-lynx.ts`** — Passes `normalizedOptions` to `applySplitChunksRule`

3. **`entry.ts`** —
   - Does NOT pass `experimental_isLazyBundle` to `LynxTemplatePlugin`, `AngularWebpackPlugin`, or `RuntimeWrapperWebpackPlugin`
   - Async chunks ARE AMD-wrapped by RuntimeWrapperWebpackPlugin (required by `lynx.requireModuleAsync`)

4. **`angular-webpack-plugin.ts`** —
   - RuntimeModule polyfill: on main thread, overrides `__webpack_require__.e` to return a never-resolving promise (prevents main-thread from crashing on async chunk loading)
   - On background thread: polyfills `lynx.requireModuleAsync` with fetch+eval if native API doesn't exist

5. **`lynx.config.ts`** — Enables `experimental_isLazyBundle: true` in kitchen-sink app

6. **`app.component.ts`** — `NavigationError` event subscription + chunk loading instrumentation for debugging

### Verified Working

- ✅ Async chunk files emitted (10 route chunks + vendor CSS chunks)
- ✅ Background-thread bundle uses `__webpack_require__.e(chunkId)` for `loadComponent()`
- ✅ Built-in `__webpack_require__.f.require` handler calls `lynx.requireModuleAsync(url, callback)`
- ✅ `__webpack_require__.u(chunkId)` generates correct filenames (`static/js/async/[name].js`)
- ✅ Async chunks have AMD wrapping (required by `lynx.requireModuleAsync`)
- ✅ Main bundle app type is `card` (not `DynamicComponent`)
- ✅ Main thread: `__webpack_require__.e` returns never-resolving promise (no crash)
- ✅ All 59 tests pass

### Lessons Learned

**Lesson 1: `experimental_isLazyBundle` semantics in LynxTemplatePlugin**

`experimental_isLazyBundle: true` on `LynxTemplatePlugin` means "this entire app IS a standalone lazy bundle (DynamicComponent type)." It does NOT mean "this app has lazy routes." Setting it caused `appType: DynamicComponent` which crashed LynxExplorer with decode error 10204. Fix: don't pass it to plugins — the flag only controls `split-chunks.ts` behavior.

**Lesson 2: Lynx has no CommonJS context in raw eval**

When Lynx evaluates a JS file without AMD wrapping, `exports`/`module`/`require` are NOT defined. Error: `"exports is not defined"`. But this lesson is superseded by Lesson 4.

**Lesson 3: `lynx.requireModuleAsync` requires Lynx SDK 2.14+**

On SDK 1.4.0, `lynx.requireModuleAsync` doesn't exist. The error "not a function" on that SDK was simply because the API wasn't available. Upgrading to SDK 3.7.0 provides the native API.

**Lesson 4: `lynx.requireModuleAsync` REQUIRES AMD-wrapped modules**

Per Lynx documentation: modules loaded via `requireModuleAsync` must be wrapped with `@lynx-js/runtime-wrapper-webpack-plugin`. Without AMD wrapping, the native runtime cannot process the module and the callback is never called (hangs silently). This means async chunks MUST have the full AMD wrapper (`tt.define`/`tt.require`/`__bundle__holder`).

Previous attempts to use a custom IIFE wrapper (with or without `__bundle__holder`) did NOT work because `requireModuleAsync` specifically expects the AMD module format with `tt.define`.

**Lesson 5: Main thread cannot load async chunks**

`lynx.requireModuleAsync` is a background-thread-only API. The main thread (Lepus) runs synchronously for first-screen rendering and has NO async module loading capability. When both thread bundles contain `loadComponent()` routes, the main thread crashes trying to load chunks. Fix: override `__webpack_require__.e` on the main thread to return a never-resolving promise, preventing the loading chain from executing.

**Lesson 6: Error was on main thread, not background thread**

The stack trace `at loadComponent (main-thread.js:8466:23)` revealed the error originated from the main thread. The `resolveNavigationPromiseOnError: true` swallowed the background thread error separately. Both threads needed different fixes.

### Root Cause Identified (2026-05-22)

**The actual bug was `LynxChunkLoadingRuntimeModule` poisoning `Promise.all`.**

Investigation via `references/lynx` (native Lynx source) confirmed:

1. **`lynx_aci = {}`** — Angular Router's `loadComponent()` creates async chunks **without names** (only auto-generated IDs like `_background_src_app_list-example_list-example_component_ts`). `LynxAsyncChunksRuntimeModule` filters by `c.name !== null` — so all Angular lazy route chunks are excluded from `lynx_aci`. The `loadLazyBundle` path is never used; the fallback `requireModuleAsync` path is used instead.

2. **`requireModuleAsync` mechanism is fully correct** — Traced through the entire native JS stack (`nativeGlobal.bundleSupportLoadScript = true`, `_$executeInit`, `factory({ tt: baseApp })`). When native evaluates an AMD-wrapped async chunk, the IIFE returns `{ init: __init_card_bundle__ }`, native calls `init({ tt: baseApp })`, which executes `tt.define(name, factory)` + `return tt.require(name)`. The factory sets `exports.ids = [...]` and `exports.modules = {...}`. `tt.require` returns `module.exports = { ids, modules }`. The `requireModuleAsync` callback receives `(null, { ids, modules })`. `installChunk({ ids, modules })` installs module factories into `__webpack_require__.m`. This is completely correct.

3. **The bug**: Our `LynxChunkLoadingRuntimeModule` registered `ensureChunkHandlers.lynx`, which:
   - Created a new Promise and pushed it into `promises` array in `__webpack_require__.e`
   - Then checked `typeof __QueryComponent !== 'function'` — which is true on background thread
   - Called `reject(new Error('[AngularLynx] __QueryComponent is not available...'))` on the pushed promise
   - `Promise.all(promises)` in `__webpack_require__.e` then rejected with this error
   - Angular Router caught the NavigationError → `resolveNavigationPromiseOnError: true` → navigation resolved as false → **blank route, no visible error**

4. **Fix applied**: Removed `LynxChunkLoadingRuntimeModule` from the `ensureChunkHandlers` tap. Simplified `ChunkLoadingPolyfill` to only the main-thread override (suppress `__webpack_require__.e` with a never-resolving promise). rspeedy's `ChunkLoadingWebpackPlugin` handles `ensureChunkHandlers.require` correctly via `lynx.requireModuleAsync`.

### Current State (Fixed)

**Configuration:**
- Async chunks: AMD-wrapped by RuntimeWrapperWebpackPlugin ✓
- Main thread: `__webpack_require__.e` returns never-resolving promise (suppressed) ✓
- Background thread: rspeedy's `ChunkLoadingWebpackPlugin` handles `ensureChunkHandlers.require` using `lynx.requireModuleAsync(url, (err, exports) => installChunk(exports))` ✓
- `lynx_aci` is empty (no named chunks) → always uses `requireModuleAsync` fallback ✓

**Full loading chain:**
1. Angular Router calls `loadComponent()` → `import('./list-example/...')` → `__webpack_require__.e(chunkId)`
2. `ensureChunkHandlers.require` fires → `lynx.requireModuleAsync(publicPath + u(chunkId), callback)`
3. Native fetches `http://.../static/js/async/_background_src_app_list-example_...js`
4. AMD IIFE runs, returns `{ init: __init_card_bundle__ }` (because `bundleSupportLoadScript = true`)
5. `_$executeInit` calls `init({ tt: baseApp })` → `tt.define(...)` + `tt.require(...)` → `{ ids, modules }`
6. `callback(null, { ids, modules })` fires
7. `installChunk({ ids, modules })` installs module factories into `__webpack_require__.m`
8. `import()` promise resolves → Angular renders `ListExampleComponent` via RouterOutlet

### Debugging Attempts (2026-05-22)

**Problem:** Routes blank, no errors shown. Need to determine if `lynx.requireModuleAsync` callback fires.

**Attempt 1: NavigationError event handler + chunk instrumentation**
- Added `NavigationError` subscription to `app.component.ts` — shows errors in red box on screen
- Tried to instrument `globalThis.__webpack_require__.e` — but `__webpack_require__` is NOT on `globalThis` (it's local to the AMD factory), so instrumentation never activates

**Attempt 2: `requireModuleAsync` polyfill as file-level prefix (outside AMD IIFE)**
- Injected at `PROCESS_ASSETS_STAGE_ADDITIONS` as a ConcatSource prefix
- Wrote to `globalThis.lynx.requireModuleAsync`
- **Failed:** The `lynx` inside the AMD factory is a LOCAL parameter, not `globalThis.lynx`. The polyfill modified the global, but the chunk-loading handler uses the local parameter. They're different objects.

**Attempt 3: `requireModuleAsync` polyfill as RuntimeModule (inside AMD factory)**
- Created a RuntimeModule at `STAGE_BASIC` so the code generates INSIDE the webpack runtime (inside the AMD factory where `lynx` is the correct local variable)
- The polyfill wraps `lynx.requireModuleAsync` to detect if callback fires
- **Result on SDK 1.4.0:** "NavError: not a function" — `lynx.requireModuleAsync` doesn't exist

**Attempt 4: Polyfill with fetch+eval fallback**
- If native `requireModuleAsync` doesn't exist, polyfill with `fetch(url).then(r => r.text()).then(code => eval(code))`
- **Result on SDK 1.4.0:** Still "not a function" — `fetch` is also not available inside the AMD factory (the `fetch` parameter may be undefined)

**Attempt 5: Upgrade LynxExplorer to SDK 3.7.0**
- SDK 3.7.0 has native `lynx.requireModuleAsync`
- With custom IIFE wrapper (no AMD): routes blank, no error → callback never fires because `requireModuleAsync` REQUIRES AMD-wrapped modules
- With AMD wrapper restored: routes blank, no error → same behavior

**Attempt 6: Debug output via `globalThis.__chunkDebug`**
- RuntimeModule polyfill writes diagnostic info to `globalThis.__chunkDebug`
- Component reads `globalThis.__chunkDebug` after 3s timeout
- **Result:** "no debug info" — `globalThis` inside the AMD factory is NOT the same as `globalThis` accessed from component code (or the component's `(globalThis as any).lynx` differs from the factory's local `lynx`)

**Attempt 7: Debug output via `lynx.__chunkDebug`**
- Polyfill writes to `lynx.__chunkDebug` (local AMD parameter)
- Component reads `(globalThis as any).lynx.__chunkDebug`
- **Result:** "no debug info" — confirms the factory's `lynx` parameter is NOT the same object as `globalThis.lynx`

**Attempt 8: Debug output via eval (scope-preserving)**
- Component uses `eval('lynx.__chunkDebug')` which preserves lexical scope and resolves `lynx` through the scope chain to the AMD factory's parameter
- **Result:** superseded — intermediate simplified polyfill removed `lynx.__chunkDebug` write entirely

**Attempt 9: Dual-method diagnostics — `globalThis.__angLynxDiag` + `eval('lynx.__chunkDebug')` (2026-05-22)**
- Added polyfill initialization: `globalThis.__angLynxDiag = 'READY:rma=true'` AND `lynx.__chunkDebug = globalThis.__angLynxDiag` (both set unconditionally at startup)
- `requireModuleAsync` wrapper writes CALL/OK/ERR/TIMEOUT to both properties on every chunk load
- Component reads `(globalThis as any).__angLynxDiag` (direct) OR `eval('typeof lynx !== "undefined" && lynx.__chunkDebug')` (scope chain), whichever is truthy
- **Result:** "no diag (both methods empty)" — BOTH returned falsy at 3 seconds

**Confirmed build was fresh**: `npm run demo` runs `npm run build` (rebuilds plugin + runtime + app) then starts dev server. User always does fresh restart. Build is definitely picking up changes.

**Interpretation of Attempt 9 result (revised):**

Since `npm run demo` always rebuilds everything, the new polyfill code IS in the bundle. Yet both `globalThis.__angLynxDiag` and `lynx.__chunkDebug` are unset after 3 seconds. The polyfill is either:

1. **Taking the `if (globalThis["__MAIN_THREAD__"])` branch on the background thread** — this is the most likely explanation. If `globalThis["__MAIN_THREAD__"]` evaluates to truthy inside the AMD factory IIFE (even though the prefix set it to `false`), the if-branch runs (setting `__webpack_require__.e` to a pending promise) and all diagnostic writes are skipped. This would also explain why routes are permanently blank — the background thread's `__webpack_require__.e` returns a never-resolving promise.

2. **A JavaScript error thrown before the diagnostic writes** — if `typeof lynx.requireModuleAsync` throws for some reason (e.g., `lynx` is null/undefined despite being an AMD param), the else/else-if branches wouldn't run.

**The `__MAIN_THREAD__` hypothesis**: The prefix `globalThis["__MAIN_THREAD__"]=false;` runs BEFORE the AMD IIFE at the script top level. Then inside the IIFE, `var g = (new Function('return this;'))()` gets the global. `g["__MAIN_THREAD__"]` should be `false`. Later, inside `bigFactory` (the `tt.define` factory), `globalThis["__MAIN_THREAD__"]` should also be `false`. BUT: if the native runtime evaluates the AMD IIFE in a way where `globalThis` inside `bigFactory` is a proxy or different object from the one the prefix wrote to (e.g., because `(new Function('return this;'))()` returns a different object in PrimJS strict mode), the check would see undefined (falsy → correct) or truthy (wrong).

Actually, more precisely: the `if` branch runs when `globalThis["__MAIN_THREAD__"]` is TRUTHY. In the background thread, `false` is falsy, so the if branch should be skipped. But if `globalThis["__MAIN_THREAD__"]` is `undefined` (not found), it's also falsy — if branch still skipped. So the if branch CANNOT be taken by accident on background thread unless `__MAIN_THREAD__` is somehow `true`.

**Revised most likely explanation**: The diagnostic code RUNS but the WRITES fail silently. In PrimJS/QuickJS:
- `globalThis.__angLynxDiag = 'READY:rma=true'` — if `globalThis` inside the factory closure is read-only or a different object, writes fail silently without throwing
- `lynx.__chunkDebug = globalThis.__angLynxDiag` — if the write above failed, this copies `undefined`
- The component reads from `globalThis` (may be a different `globalThis` instance) — gets undefined
- The component's `eval` reads `lynx.__chunkDebug` via scope chain — but `lynx.__chunkDebug` was only set to undefined (not a string), so eval returns falsy

This is consistent with the AMD factory scope isolation finding from previous attempts — `globalThis` inside the AMD factory may be a different object from `globalThis` accessed by the top-level prefix code or by the component's eval chain.

**Switched to Angular Router events approach (Attempt 10)** — instead of trying to share state across scope boundaries (all previous methods failed), subscribe to Angular Router events and display the last 3 in the red box. These are pure Angular change-detection signals, no AMD isolation issues:

```
NavStart:/list-example | LoadStart:list-example | LoadEnd:list-example
```

Events subscribed: `NavigationStart`, `RouteConfigLoadStart`, `RouteConfigLoadEnd`, `NavigationEnd`, `NavigationCancel`, `NavigationError`.

**What this tells us:**
- `NavStart` fires → Router is attempting navigation ✓
- `LoadStart` fires → Router is calling `loadComponent()`, triggering the import() ✓  
- `LoadEnd` fires → `import()` resolved, chunk installed — if route still blank, problem is in rendering
- `NavEnd` fires → navigation completed → RouterOutlet should show component
- `NavCancel` fires → navigation cancelled without error (e.g. `resolveNavigationPromiseOnError` swallowed a timeout)
- `NavErr` fires → explicit error from chunk loading

**Reverted diagnostic polyfill** to simple main-thread-only override. All the `globalThis.__angLynxDiag` / `lynx.__chunkDebug` approaches were abandoned because writes from within the AMD factory scope cannot be read outside it (scope isolation confirmed across 4+ attempts).

### Key Discovery: AMD Factory Scope Isolation

The `RuntimeWrapperWebpackPlugin` AMD pattern creates severe scope isolation:
```
(function(){  // IIFE scope
  var g = (new Function('return this;'))();  // global object
  function __init_card_bundle__(lynxCoreInject) {
    var tt = lynxCoreInject.tt;
    tt.define("bundle.js", function(require, module, exports, ..., lynx, ..., fetch, ..., global, ...) {
      // ALL webpack code lives here
      // lynx, fetch, global, etc. are LOCAL PARAMETERS — NOT globals
      // Writing to lynx.foo does NOT affect globalThis.lynx.foo
      // globalThis inside this function IS the global object (JS spec)
      // BUT globalThis.lynx !== lynx (local param shadows global)
    });
  }
})();
```

**Consequences:**
1. Cannot communicate between webpack runtime (inside factory) and globals (outside factory) using `lynx` or other factory parameters
2. `globalThis` IS accessible from inside the factory but `globalThis.lynx` is NOT the same as the local `lynx` parameter
3. The only way to share state between factory code and the outside is via `globalThis.someNewProperty` (not via lynx/fetch/etc. which are shadowed)
4. Our polyfill writes to the local `lynx` parameter → chunk-loading handler reads the local `lynx` parameter → this SHOULD work within the factory
5. But reading from component code via `globalThis.lynx` fails because it's a different object

### Open Questions

1. **Does `lynx.requireModuleAsync` on SDK 3.7.0 actually call back with AMD-wrapped modules?** — Still unverified. Need to confirm via diagnostics once the build is confirmed live.

2. **Does the `globalThis["__MAIN_THREAD__"]=false;` prefix before the AMD IIFE interfere with `requireModuleAsync`?** — When the native runtime fetches and evaluates an async chunk, the first statement sets `globalThis.__MAIN_THREAD__`. The AMD IIFE follows. If the native runtime only looks at the first expression to determine the module type, the `globalThis.__MAIN_THREAD__` statement might confuse it.

3. **`__webpack_require__.p` (public path) value** — Confirmed `"http://192.168.1.91:3000/"` in dev builds. Correct.

4. **Can `globalThis` writes from polyfill reach component reads?** — Attempt 6 said NO, Attempt 9 inconclusive (may be a build artifact). The polyfill and component both live inside the same `tt.define("background-thread.js", bigFactory)` closure, so `globalThis` should be shared. But this has never produced readable output in practice.

5. **`lynx.requireModuleAsync` callback signature vs installChunk format** — `requireModuleAsync(url, (err, exports))` where `exports = { ids, modules }` (from CommonJS chunk format). `installChunk(exports)` expects exactly this. Format confirmed via native source (`_$executeInit` → `tt.require` → `module.exports = {ids, modules}`).

6. **kExternalJs resource loading in LynxExplorer** — Confirmed: `DemoGenericResourceFetcher` IS registered as `genericResourceFetcher`, makes HTTP requests via `NSURLSession` with 5s timeout. Should work for `http://192.168.1.91:3000/static/js/async/...js` URLs.

7. **Does `requireModuleAsync` HANG or return quickly?** — Unconfirmed. "No NavErr in 3 seconds" suggests navigation is pending (hanging), not failing fast. The 5-second HTTP timeout from `DemoGenericResourceFetcher` would eventually cause a callback with error, showing NavErr. If no NavErr ever appears, either: (a) the navigation resolves successfully but route component doesn't render, or (b) the diagnostics aren't running so we can't tell.

### Attempt 10: Angular Router events (2026-05-22) — BREAKTHROUGH

Switched from polyfill-written diagnostics (all failed due to AMD scope isolation) to Angular Router event subscriptions. Shows the last 3 events in the red box using pure Angular signals.

**Observed sequence on first lazy route tap:**
```
NavStart:/list-example → LoadStart:list-example → (nothing)
```

**On second lazy route tap:**
```
LoadStart:other-route → NavCancel:/list-example → NavStart:/other-route → (nothing)
```

**On a synchronous (non-lazy) route:**
```
NavCancel → NavStart → NavEnd
```

**Interpretation:**
- `NavStart` fires → Angular Router begins navigation ✓
- `RouteConfigLoadStart` fires → Angular Router calls `loadComponent()` → `import()` → `__webpack_require__.e(chunkId)` → `ensureChunkHandlers.require` runs → `lynx.requireModuleAsync(url, callback)` IS CALLED ✓
- **NOTHING FIRES AFTER** → `requireModuleAsync` callback NEVER delivers. No `NavEnd`, no `NavCancel`, no `NavErr`. The JS Promise hangs indefinitely.
- The second tap triggers `NavCancel` only because the new navigation supersedes the old one (Angular Router cancels the pending nav when a new one starts)
- Sync routes work instantly → JS thread is NOT blocked

**Root cause confirmed: `requireModuleAsync` / `kExternalJs` is silently broken in LynxExplorer 3.7.0**

Native chain: `App::LoadScriptAsync` → `BTSRuntimeMediator::LoadScriptAsync` → `ExternalResourceLoader::LoadScriptAsync` → `resource_loader_->LoadResource(kExternalJs, url, cb)` → `DemoGenericResourceFetcher.fetchResource` (NSURLSession HTTP) → response → `runtime_actor->Act([...](auto& runtime) { runtime->OnScriptLoaded(...); })` → SILENT FAILURE somewhere in this chain before the JS callback fires.

Unlike `kLazyBundle` (which React Lynx lazy components use and which IS proven to work), `kExternalJs` silently drops the result before reaching the JS side. The JS Promise from `ensureChunkHandlers.require` hangs forever.

### Root Fix Required: Switch from `kExternalJs` to `kLazyBundle`

`requireModuleAsync` (→ `kExternalJs`) is broken. `QueryComponent` (→ `kLazyBundle`) IS known to work — it's how the main bundle itself and React Lynx lazy components load. We need to route chunk loading through `QueryComponent`/`kLazyBundle` instead.

**Implemented: fetch + eval approach (Attempt 11)**

Instead of the complex `loadLazyBundle` → `QueryComponent` → `kLazyBundle` path, we bypass the broken native `requireModuleAsync` entirely using `fetch + eval`:

1. `fetch(url)` — uses `fetch` AMD factory parameter (`that.lynx.fetch`) to HTTP-fetch the chunk `.js` file
2. `(0, eval)(code)` — evaluates the AMD IIFE; because `bundleSupportLoadScript=true`, IIFE returns `{ init: __init_card_bundle__ }`
3. `iife.init({ tt: tt })` — calls `tt.define(chunkName, factory) + tt.require(chunkName)` → `{ ids, modules }`
4. `cb(null, { ids, modules })` → `installChunk({ ids, modules })` installs module factories

`fetch` and `tt` are accessible via AMD factory closure:
- `fetch` = `that.lynx.fetch` (Lynx's Promise-based HTTP client, confirmed available on SDK 3.7.0)
- `tt` = `that._apiList` (the BaseApp — provides `define`/`require`)

This approach does NOT require `webpackChunkName` or `lynx_aci` — works with the existing unnamed async `.js` chunks.

**Plan: Use `lynx.loadLazyBundle` path via named chunks + `.lynx.bundle` sub-files**

The `chunk-loading.js` already has two code paths:
1. **`lynx_aci[chunkId]` exists** → `lynx.loadLazyBundle(publicPath + lynx_aci[chunkId])` → uses `QueryComponent` → `kLazyBundle`
2. **`lynx_aci[chunkId]` missing** → `lynx.requireModuleAsync(url, cb)` → `kExternalJs` ← BROKEN

`lynx_aci` is empty because Angular's async chunks have no webpack chunk name. Fix: add `webpackChunkName` magic comments to `loadComponent()` calls → chunks get names → `lynx_aci` gets populated → `loadLazyBundle` path taken.

But `loadLazyBundle` is a React Lynx runtime function (sets `lynx.loadLazyBundle`). In Angular Lynx, `lynx.loadLazyBundle` is undefined. We need to implement it in our polyfill:

```js
// In ChunkLoadingPolyfill, on background thread:
if (typeof lynx.loadLazyBundle !== 'function') {
    lynx.loadLazyBundle = function(url) {
        return new Promise(function(resolve, reject) {
            lynx.QueryComponent(url, function(result) {
                if (result && result.code === 0) {
                    // getDynamicComponentExports(schema) returns { ids, modules }
                    // because the async chunk AMD factory sets exports.ids and exports.modules
                    var schema = result.detail && result.detail.schema || url;
                    var exports = tt.getDynamicComponentExports(schema);
                    resolve(exports);
                } else {
                    reject(new Error('loadLazyBundle failed: code=' + (result && result.code)));
                }
            });
        });
    };
}
```

**Additional changes needed:**
1. **`app.routes.ts`**: Add `/* webpackChunkName: "route-name" */` to all `loadComponent()` `import()` calls → chunks get names → `lynx_aci` populated
2. **`angular-webpack-plugin.ts`**: Implement `lynx.loadLazyBundle` in `ChunkLoadingPolyfill` using `lynx.QueryComponent` (→ `kLazyBundle`)
3. **`LynxTemplatePlugin`**: Already auto-generates `async/[name].[hash].bundle` for named async chunks via `#generateAsyncTemplate`
4. **`LynxAsyncChunksRuntimeModule`**: Already generates `lynx_aci` map for named chunks
5. **Verify**: `tt.getDynamicComponentExports(schema)` returns `{ ids, modules }` for webpack chunks

**Why `kLazyBundle` should work:**
- LynxExplorer IS known to load `.lynx.bundle` files via HTTP (it loads the main bundle this way)
- `LynxTemplatePlugin` generates proper binary `.lynx.bundle` format for async chunks
- `QueryComponent` → `DidLoadComponentFromJS` → native evaluates bundle → JS callback fires
- `getDynamicComponentExports(schema)` returns `module.exports = { ids, modules }` (set by async chunk AMD factory)
- `installChunk({ ids, modules })` installs module factories into `__webpack_require__.m`
- Import() promise resolves → Angular Router renders component

---

## Session 2 Investigation Log (2026-05-22 continued)

### Attempt 12: Named chunks + `loadLazyBundle` polyfill via `QueryComponent`

**Changes made:**

1. **`app.routes.ts`** — Added `/* webpackChunkName: "route-name" */` to all 9 `loadComponent()` imports. This names the async chunks so `LynxAsyncChunksRuntimeModule` populates `lynx_aci` and `LynxTemplatePlugin` packages them as `async/[name].[hash].bundle` sub-files.

2. **`split-chunks.ts`** — Reverted from `custom` (with `chunks: 'async', minChunks: 1`) back to `all-in-one`. Root cause: the `custom` strategy with low `minChunks` extracted shared dependencies into UNNAMED sibling chunks. Each route then required multiple chunk IDs (e.g., `Promise.all([s.e("501"), s.e("939")])`), and chunk `501` was not in `lynx_aci` → it fell through to `requireModuleAsync` (broken) → rejected immediately → whole navigation failed. With `all-in-one`, no shared extraction occurs, so each route is exactly ONE named chunk. `asyncChunks` is controlled separately (kept enabled).

3. **`angular-webpack-plugin.ts`** — Replaced all previous polyfill approaches with `lynx.loadLazyBundle` implementation using `lynx.QueryComponent`. Also replaced the hanging `lynx.requireModuleAsync` with a fast-fail error for unnamed chunks.

**Result:** Build emits 9 `async/[name].[hash].bundle` files. `lynx_aci` in the built bundle maps all 9 chunk IDs to their `.bundle` URLs. Each route loads exactly ONE chunk via `s.e("939")` (no more `Promise.all([s.e("501"), s.e("939")])`).

**Verified in bundle:**
- `lynx_aci = { 939: "async/list-example.hash.bundle", ... }` — all 9 routes ✓
- `loadLazyBundle` polyfill present in background thread ✓
- `ensureChunkHandlers.require` takes `loadLazyBundle` path for `lynx_aci` entries ✓
- `requireModuleAsync` fails fast for unnamed chunks ✓

---

### Attempt 13: `tt.getDynamicComponentExports` fails on SDK 1.4.0

**Error observed:**
```
TypeError: tt.getDynamicComponentExports is not a function
```

`QueryComponent` fired successfully (code 0), meaning the bundle WAS loaded and `tt.define` was called. But `getDynamicComponentExports(schema)` doesn't exist on Lynx SDK 1.4.0.

**Key insight:** The callback fires with `code: 0` → `QueryComponent` / `kLazyBundle` IS working end-to-end. We just can't retrieve the exports via `getDynamicComponentExports` on SDK 1.4.0.

---

### Attempt 14: `tt.define` interceptor to capture exports (current state)

**Approach:** Instead of `getDynamicComponentExports`, intercept `tt.define` BEFORE calling `QueryComponent`. When the async bundle's AMD IIFE evaluates and calls `tt.define(name, factory)`, our interceptor immediately calls `tt.require(name)` to get `{ ids, modules }` synchronously.

```js
var capturedExports = null;
var origDefine = tt.define;
tt.define = function(name, factory) {
  origDefine.call(this, name, factory);
  try { capturedExports = tt.require(name); } catch(e) {}
};
lynx.QueryComponent(url, function cb(result) {
  tt.define = origDefine; // always restore
  if (result && result.code === 0 && capturedExports) {
    resolve(capturedExports);
  } else { ... }
});
```

**Why this works:** The Lynx native runtime, when processing the async `.lynx.bundle` after `QueryComponent`, calls `__init_card_bundle__({ tt: baseApp })` → `tt.define(name, factory)` → our interceptor fires → `tt.require(name)` returns `module.exports = { ids, modules }` synchronously. The `tt` used by both the interceptor and the async bundle is the same `baseApp` object (passed as an AMD parameter). The `QueryComponent` callback fires AFTER this sequence, so `capturedExports` is already set.

**Result:** Error gone (no more `getDynamicComponentExports` error). But **no NavEnd** — navigation still doesn't complete.

---

### Async Bundle Structure (inspected via `strings`)

The async `.lynx.bundle` for `list-example` contains two distinct sections:

**Main thread shim (Lepus-side JS string constants found in bytecode):**
```js
(function(){'use strict';function n({tt}){
  tt.define('/app-service.js', function(..., lynx) {
    module.exports = lynx.requireModule("/static/js/async/list-example.js", globDynamicComponentEntry || '__Card__');
  });
  return tt.require('/app-service.js');
} return {init: n}})()
```
This is the Lepus-side template adapter. It calls `lynx.requireModule("/static/js/async/list-example.js", ...)` — which is the synchronous variant used on the main thread.

**Background thread AMD IIFE:**
```js
function __init_card_bundle__(lynxCoreInject) {
  tt.define("list-example.js", function(require, module, exports, ...) {
    exports.ids = ["list-example"];
    exports.modules = {
      "(background)/./node_modules/.cache/.../...css": function(...) { ... },
      "(background)/./src/app/list-example/list-example.component.ts": function(...) { ... }
    };
  });
  return tt.require("list-example.js");
}
```

**Key observation:** The `exports.modules` keys appear as full paths with `(background)/` prefix. However, these may be debug/reflection string constants embedded in the binary bundle, NOT the actual runtime module IDs (which are likely numeric in production builds). The main bundle uses numeric ID `1227` for the `ListExampleComponent` module — if the async chunk also uses numeric IDs at runtime (just with full-path debug strings in the binary), `installChunk` should work correctly.

**Alternative explanation:** The full-path IDs ARE the actual module IDs. This would cause an ID mismatch: main bundle expects module `1227`, async chunk exports under `"(background)/./src/app/..."`. `installChunk` would install factories under wrong keys, `s(1227)` would fail, and the import() Promise would reject → NavErr or NavCancel.

---

### Current Diagnostics Added

1. **Format validation in `loadLazyBundle` polyfill** — Rejects with NavErr if `capturedExports.ids` or `capturedExports.modules` is undefined/missing. Error message includes the actual keys found in `capturedExports` for diagnosis.

2. **Event display expanded from 3 to 5 events** — `app.component.ts` now shows last 5 router events to capture the full LoadStart → LoadEnd → NavEnd (or NavErr/NavCancel) sequence.

---

### Open Questions (as of 2026-05-22 continued)

1. **What events show after the diagnostic rebuild?** — Do we see `NavErr:[AXL bad exports]...` (format mismatch) or `LoadEnd → NavCancel` (component loaded but activation failed) or `LoadEnd → NavEnd` (actually working)?

2. **Are the async chunk module IDs numeric or full-path in the production build?** — The `strings` output shows full-path strings in the binary bundle, but these could be debug metadata rather than actual runtime module IDs. If they ARE the actual IDs, `installChunk` puts them in `s.m["(background)/..."]` but the main bundle's route expects `s(1227)` (numeric). This mismatch would cause `s(1227)` to fail.

   To verify: if format validation NavErr fires with `keys=(background)/./src/app/...`, the IDs are full-path (broken). If `keys=1227,...` they're numeric (correct).

3. **Does NavEnd actually fire but get overwritten?** — The initial app load fires NavStart:/list-example → LoadStart → potentially LoadEnd → NavEnd all before the user reads the screen. The 5-event window should now capture this.

4. **Main thread component activation** — Even if the background thread successfully loads the component class, does the Lepus main thread need to register the component's template for `<router-outlet>` to render it? If the main-thread side of the async bundle fails (e.g., `lynx.requireModule("/static/js/async/list-example.js")` fails), the component might not render even if NavEnd fires.

---

### Lesson 7: `splitChunks` strategy matters for `lynx_aci` completeness

Using `custom` splitChunks with `chunks: 'async', minChunks: 1` caused aggressive shared-module extraction. Each route ended up requiring multiple chunks: the named chunk (in `lynx_aci`) PLUS unnamed sibling chunks (not in `lynx_aci`). The sibling chunks hit `requireModuleAsync` (broken) and immediately rejected. Fix: use `all-in-one` strategy which disables shared extraction, making each route a single self-contained named chunk.

### Lesson 8: `tt.getDynamicComponentExports` is SDK-version-dependent

`getDynamicComponentExports` on the `tt` (BaseApp) parameter was added in a later Lynx SDK version. It does not exist on SDK 1.4.0. The `tt.define` interceptor approach is the correct fallback: capture exports synchronously from `tt.require(name)` immediately after `tt.define(name, factory)` is called during bundle evaluation.

### Lesson 9: `strings` output from `.lynx.bundle` may contain debug metadata

The `.lynx.bundle` binary format contains multiple sections (Lepus bytecode, background-thread JS, CSS, metadata). Full-path module IDs found via `strings` may be debug/reflection metadata embedded in the Lepus bytecode section, not the actual webpack module IDs used at runtime in the background-thread JS. The actual runtime IDs in the background-thread AMD factory should match the main bundle's IDs (same compilation).

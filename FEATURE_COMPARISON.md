# Feature Comparison: AngularLynx vs React Lynx vs Vue Lynx

## Core Renderer

| Feature                                    | AngularLynx |  React Lynx   |     Vue Lynx     |
| ------------------------------------------ | :---------: | :-----------: | :--------------: |
| Element creation (view, text, image, etc.) |     ✅      |      ✅       |        ✅        |
| Text nodes                                 |     ✅      |      ✅       |        ✅        |
| Comment/anchor nodes                       |     ✅      |      ✅       |        ✅        |
| Tree manipulation (append, insert, remove) |     ✅      |      ✅       |        ✅        |
| Inline styles                              |     ✅      |      ✅       |        ✅        |
| Classes                                    |     ✅      |      ✅       |        ✅        |
| Attributes                                 |     ✅      |      ✅       |        ✅        |
| Scoped CSS (component encapsulation)       |     ✅      |      ✅       |        ✅        |
| Dual-thread architecture                   |     ✅      |      ✅       |        ✅        |
| Background-thread virtual tree             |     ✅      | ✅ (snapshot) | ✅ (shadow tree) |

## Events

| Feature                                                |           AngularLynx            |            React Lynx             |         Vue Lynx         |
| ------------------------------------------------------ | :------------------------------: | :-------------------------------: | :----------------------: |
| Basic event binding (`bindtap`, etc.)                  |                ✅                |                ✅                 |            ✅            |
| Event prefixes (bind/catch/capture-bind/capture-catch) |                ✅                |                ✅                 |   ✅ (.stop modifier)    |
| Global events                                          |                ❌                | ✅ (`useLynxGlobalEventListener`) |  ✅ (`bindGlobalEvent`)  |
| Event modifiers                                        | N/A (Angular doesn't have these) |                N/A                | ✅ (.once, .stop, .self) |

## List Virtualization

| Feature                        |         AngularLynx         |       React Lynx        | Vue Lynx |
| ------------------------------ | :-------------------------: | :---------------------: | :------: |
| `<list>` with componentAtIndex |             ✅              |           ✅            |    ✅    |
| Item recycling                 | ✅ (via RouteReuseStrategy) |  ✅ (reuse-identifier)  |    ✅    |
| Diff-based updates             |             ✅              |           ✅            |    ✅    |
| Deferred list items            |             ❌              | ✅ (`DeferredListItem`) |    ❌    |
| Batch update scheduling        |             ✅              |           ✅            |    ✅    |

## Gestures

| Feature                                         | AngularLynx |                    React Lynx                    |     Vue Lynx     |
| ----------------------------------------------- | :---------: | :----------------------------------------------: | :--------------: |
| Gesture system                                  |     ❌      | ✅ (TAP, PAN, FLING, PINCH, ROTATION, LONGPRESS) | ❌ (events only) |
| Gesture composition (waitFor, simultaneousWith) |     ❌      |                        ✅                        |        ❌        |
| Worklet-based gesture callbacks                 |     ❌      |                        ✅                        |        ❌        |

## Animations

| Feature                               |   AngularLynx    |     React Lynx     |                   Vue Lynx                    |
| ------------------------------------- | :--------------: | :----------------: | :-------------------------------------------: |
| `element.animate()` (JS keyframe API) |        ✅        |         ✅         |              ❌ (no direct API)               |
| CSS transitions                       | ❌ (not exposed) | ❌ (worklet-based) |         ✅ (`<Transition>` component)         |
| CSS `@keyframes` animations           |     Untested     |         ❌         |               ✅ (class-based)                |
| Transition component                  |        ❌        |         ❌         | ✅ (experimental, needs explicit `:duration`) |
| TransitionGroup                       |        ❌        |         ❌         |               ⚠️ (no move/FLIP)               |

## Main Thread Scripting (MTS)

| Feature                | AngularLynx |       React Lynx        |         Vue Lynx          |
| ---------------------- | :---------: | :---------------------: | :-----------------------: |
| `runOnMainThread()`    |     ❌      |           ✅            |            ❌             |
| `runOnBackground()`    |     ❌      |           ✅            |       ✅ (limited)        |
| Main thread refs       |     ❌      | ✅ (`useMainThreadRef`) |  ✅ (`:main-thread-ref`)  |
| Worklet event handlers |     ❌      |           ✅            | ✅ (`:main-thread-bind*`) |

## Routing / Navigation

| Feature                               |     AngularLynx      |       React Lynx       |            Vue Lynx             |
| ------------------------------------- | :------------------: | :--------------------: | :-----------------------------: |
| In-memory router                      |     ✅ (custom)      | ❌ (uses native pages) | ✅ (vue-router + memoryHistory) |
| Lazy-loaded routes                    |          ✅          |           ❌           |               ✅                |
| Route reuse / element pool management | ✅ (custom strategy) |           ❌           |               ❌                |
| History stack                         |          ✅          |           ❌           |               ✅                |

## Data Flow / Platform Integration

| Feature                 | AngularLynx |       React Lynx        | Vue Lynx |
| ----------------------- | :---------: | :---------------------: | :------: |
| InitData pattern        |     ❌      |  ✅ (provider + hook)   |    ❌    |
| GlobalProps pattern     |     ❌      |  ✅ (provider + hook)   |    ❌    |
| Data processors         |     ❌      |           ✅            |    ❌    |
| Native module bridge    |     ❌      | ✅ (`lynx.getJSModule`) |    ❌    |
| Session storage service |     ❌      |      ❌ (raw API)       |    ❌    |
| System info service     |     ❌      |      ❌ (raw API)       |    ❌    |

## Lazy Loading / Code Splitting

| Feature                        | AngularLynx |      React Lynx       |          Vue Lynx           |
| ------------------------------ | :---------: | :-------------------: | :-------------------------: |
| Route-level lazy loading       |     ✅      |          ❌           |             ✅              |
| Component-level lazy loading   |     ❌      | ✅ (`loadLazyBundle`) | ✅ (`defineAsyncComponent`) |
| Suspense / async boundaries    |     ❌      |          ✅           |             ✅              |
| First-screen sync optimization |     ❌      |    ✅ (Lepus mode)    |             ❌              |

## SSR / Hydration

| Feature                   |            AngularLynx            |             React Lynx              | Vue Lynx |
| ------------------------- | :-------------------------------: | :---------------------------------: | :------: |
| Server-side rendering     | ❌ (flag exists, not implemented) |     ✅ (snapshot serialization)     |    ❌    |
| Hydration                 |                ❌                 |                 ✅                  |    ❌    |
| First-screen optimization |                ❌                 | ✅ (`__FIRST_SCREEN_SYNC_TIMING__`) |    ❌    |

## Error Handling

| Feature                        |      AngularLynx       |       React Lynx        |        Vue Lynx        |
| ------------------------------ | :--------------------: | :---------------------: | :--------------------: |
| Error boundary / recovery      |           ❌           | ✅ (`useErrorBoundary`) | ✅ (`onErrorCaptured`) |
| Global unhandled error capture | ✅ (`__lynxLastError`) | ✅ (`lynx.reportError`) |           ✅           |
| Component-level error UI       |           ❌           |           ✅            |           ✅           |

## Testing

| Feature                      | AngularLynx |        React Lynx        |             Vue Lynx              |
| ---------------------------- | :---------: | :----------------------: | :-------------------------------: |
| Testing library              |     ❌      | ✅ (testing-library API) |     ✅ (@vue/testing-library)     |
| Component rendering in tests |     ❌      |            ✅            | ✅ (dual-thread pipeline + JSDOM) |
| Event simulation             |     ❌      |            ✅            |         ✅ (`fireEvent`)          |
| Test runner integration      |     ❌      |   ✅ (Vitest, Rstest)    |            ✅ (Vitest)            |

## Developer Experience

| Feature                                  |      AngularLynx       |         React Lynx          |         Vue Lynx         |
| ---------------------------------------- | :--------------------: | :-------------------------: | :----------------------: |
| Project scaffolding CLI                  |           ❌           |             ❌              |  ✅ (`create-vue-lynx`)  |
| IDE type support for Lynx elements       |  ✅ (directive stubs)  |             ✅              |    ✅ (Volar plugin)     |
| HMR                                      | ❌ (live reload only)  |        ❌ (unclear)         |            ✅            |
| Build diagnostics (invalid elements/CSS) |           ✅           |             ❌              |            ❌            |
| DevTools integration                     |           ❌           | ⚠️ (profile hooks, logging) | ⚠️ (Vue devtools option) |
| Documentation site                       |           ❌           |             ❌              |   ✅ (vue.lynxjs.org)    |
| Example gallery                          | ❌ (kitchen-sink only) |             ❌              |     ✅ (26 examples)     |

## Build Plugin

| Feature                               |    AngularLynx     |   React Lynx    |       Vue Lynx       |
| ------------------------------------- | :----------------: | :-------------: | :------------------: |
| AOT compilation                       |         ✅         |       N/A       |         N/A          |
| JIT compilation                       |         ✅         |       N/A       |         N/A          |
| Tailwind CSS                          | ✅ (auto-detected) |       ✅        |          ✅          |
| CSS Modules                           |         ❌         |       ✅        |          ✅          |
| Dual-thread entry splitting           |         ✅         |       ✅        |          ✅          |
| Auto CUSTOM_ELEMENTS_SCHEMA injection |         ✅         |       N/A       |  N/A (isNativeTag)   |
| Worklet transform                     |         ❌         | ✅ (SWC plugin) | ✅ (worklet loaders) |

## Accessibility

| Feature                       | AngularLynx |    React Lynx    |     Vue Lynx     |
| ----------------------------- | :---------: | :--------------: | :--------------: |
| a11y attributes on directives |     ❌      | ❌ (passthrough) | ❌ (passthrough) |
| Screen reader API wrapper     |     ❌      |        ❌        |        ❌        |
| `enableA11y` build option     |     ✅      |        ❌        |        ❌        |

## Summary

### AngularLynx strengths (unique or best-in-class)

- Custom route reuse strategy that manages Lynx's element pool
- Build-time diagnostics catching invalid HTML elements and unsupported CSS
- Auto CUSTOM_ELEMENTS_SCHEMA injection (zero config for template type-checking)
- Tailwind auto-detection

### Biggest gaps vs React Lynx

1. Gesture system (React Lynx's killer feature)
2. Main thread scripting / worklets
3. Lazy bundle loading (non-route)
4. SSR / hydration / first-screen optimization
5. Testing library
6. Data flow patterns (InitData, GlobalProps)

### Biggest gaps vs Vue Lynx

1. HMR (Vue has it working)
2. Testing library
3. `<Transition>` / animation component abstraction
4. Project scaffolding CLI
5. Documentation site & example gallery
6. CSS Modules

### Both React & Vue have, Angular doesn't

- Component-level error boundaries with recovery UI
- Suspense / async component loading
- Main thread refs and worklet event handlers
- Dedicated testing utilities

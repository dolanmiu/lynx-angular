# lynx-angular

Angular renderer for [Lynx](https://lynxjs.org/) — a cross-platform native UI framework (ByteDance). Write Angular, render to native mobile/web via Lynx runtime. **WIP proof of concept.**

## Architecture

Lynx uses a dual-thread model: **main thread** (native UI rendering) and **background thread** (JS execution/layout). Elements are manipulated via global `__*` functions (`__CreateElement`, `__AppendElement`, `__SetAttribute`, `__AddInlineStyle`, `__AddEvent`, `__RemoveElement`, etc.) instead of browser DOM. Native elements: `x-view`, `x-text`, `x-image`, `x-scroll-view`, `x-list`, `x-block`, `x-if`, `x-for`.

## Monorepo Structure (npm workspaces)

```
packages/
  rsbuild-plugin-angular-lynx/   # @blotch/rsbuild-plugin-angular-lynx — RSpeedy build plugin for Angular+Lynx
    src/
      pluginAngularLynx.ts   # Main entry: CSS, entry, layers, rules, generation
      entry.ts               # Splits code into main-thread/background-thread layers
      layers.ts              # Webpack layers (ES2019 main, ES2015 background)
      angular.ts             # Angular TS compilation via @angular-build
      AngularWebpackPlugin.ts
  runtime/         # Core library — Angular Renderer2 → Lynx API bridge
    src/lib/
      renderer.ts              # LynxRenderer implements Renderer2
      lynx-renderer-factory2.ts # RendererFactory2 impl
      lynx-document.ts         # LynxDocument (main) + LynxBackgroundDocument (background)
      lynx-element.ts          # LynxElement (main) + LynxBackgroundElement (background)
      runtime.ts               # bootstrapLynxApplication() entry point
      providers.ts             # provideLynxRenderer() DI setup
      types/lynx.ts            # Global Lynx API type declarations
  demo-app/        # Demo app with routing, signals, Lynx elements
    lynx.config.ts             # RSpeedy config using pluginAngularLynx()
```

## Key Patterns

- `bootstrapLynxApplication(AppComponent, config)` replaces Angular's browser bootstrap
- `provideLynxRenderer()` + zoneless change detection in app config
- Templates use Lynx elements: `<x-view>`, `<x-text>`, not HTML
- Standalone components, signals, `@if`/`@for` control flow, lazy-loaded routes all work

## Build & Run

```sh
npm install && npm run build   # Build all packages
npm run demo                   # Start demo dev server (rspeedy)
```

## Not Yet Implemented

Emulated view encapsulation, HMR, live reload, background-thread directives, compiler warnings.

# lynx-angular

Angular renderer for [Lynx](https://lynxjs.org/) — a cross-platform native UI framework (ByteDance). Write Angular, render to native mobile/web via Lynx runtime. **WIP proof of concept.**

## Architecture

Lynx uses a dual-thread model: **main thread** (native UI rendering) and **background thread** (JS execution/layout). Elements are manipulated via global `__*` functions (`__CreateElement`, `__AppendElement`, `__SetAttribute`, `__AddInlineStyle`, `__AddEvent`, `__RemoveElement`, etc.) instead of browser DOM. Native elements: `x-view`, `x-text`, `x-image`, `x-scroll-view`, `x-list`, `x-block`, `x-if`, `x-for`.

## Monorepo Structure

- `packages/runtime` — Core Angular renderer for Lynx (the main library)
- `packages/demo-app` — Demo Angular app running on Lynx
- `packages/rsbuild-plugin-angular-lynx` — Rsbuild plugin for building Angular Lynx apps
- `references/lynx-stack-main/packages/react` — **React Lynx** (production-proven reference implementation). Always refer to how React Lynx does things — it's battle-tested and used in production. When unsure about renderer design, element handling, or Lynx API usage, check this reference first.

## Key Patterns

- `bootstrapLynxApplication(AppComponent, config)` replaces Angular's browser bootstrap
- `provideLynxRenderer()` + zoneless change detection in app config
- Templates use Lynx elements: `<x-view>`, `<x-text>`, not HTML
- Standalone components, signals, `@if`/`@for` control flow, lazy-loaded routes all work

## Code Style

- Always write comments explaining **why** something is done, not just what. Future developers need to understand the reasoning and intent behind decisions.

## Build & Run

```sh
npm install && npm run build   # Build all packages
npm run demo                   # Start demo dev server (rspeedy)
```

## Debugging

The demo runs on-device (iPhone) — there is no browser console. To debug, render logs on screen using `<x-text>` elements instead of `console.log`.

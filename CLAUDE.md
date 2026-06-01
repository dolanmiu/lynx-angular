# AngularLynx

Angular renderer for [Lynx](https://lynxjs.org/) — a cross-platform native UI framework (ByteDance). Write Angular, render to native mobile/web via Lynx runtime. **WIP proof of concept.**

## Architecture

Lynx uses a dual-thread model: **main thread** (native UI rendering) and **background thread** (JS execution/layout). Elements are manipulated via global `__*` functions (`__CreateElement`, `__AppendElement`, `__SetAttribute`, `__AddInlineStyle`, `__AddEvent`, `__RemoveElement`, etc.) instead of browser DOM. Native elements: `view`, `text`, `image`, `scroll-view`, `list`, `block`, `if`, `for`.

## Monorepo Structure

- `packages/runtime` — Core Angular renderer for Lynx (published as `@blotch/angular-lynx`)
- `packages/rsbuild-plugin-angular-lynx` — Rsbuild plugin for building AngularLynx apps (published as `@blotch/rsbuild-plugin-angular-lynx`)
- `packages/create-angular-lynx` — Zero-setup scaffolder: `npm create angular-lynx <name>` runs `ng new` then `ng add @blotch/angular-lynx` automatically
- `packages/kitchen-sink-app` — Kitchen sink Angular app running on Lynx
- `references/lynx-stack-main/packages/react` — **React Lynx** (production-proven reference implementation). Always refer to how React Lynx does things — it's battle-tested and used in production. When unsure about renderer design, element handling, or Lynx API usage, check this reference first.
- `references/lynx-website-main` — **Lynx official documentation website**. Contains API docs, guides, element/CSS/native API compatibility data, and examples. Reference for understanding Lynx platform capabilities, supported elements, CSS properties, and API status across platforms.
- `references/lynx` — **Lynx core source code**. The actual C++/JS implementation of the Lynx runtime. Check here to understand how native elements, the dual-thread model, and platform APIs are implemented under the hood.

## Goal

Near-1:1 Angular parity — partial support isn't acceptable. Every Angular API (RouterOutlet, ViewContainerRef.createComponent(), NgComponentOutlet, etc.) should work on Lynx. If something doesn't work, fix the renderer rather than building workarounds.

## Key Patterns

- `bootstrapApplication(AppComponent, config)` replaces Angular's browser bootstrap
- `provideRenderer()` + zoneless change detection in app config
- Templates use Lynx elements: `<view>`, `<text>`, not HTML
- Standalone components, signals, `@if`/`@for` control flow, lazy-loaded routes all work

## Code Style

- Always write comments explaining **why** something is done, not just what. Future developers need to understand the reasoning and intent behind decisions.

## Schematics (`ng add` / `ng generate`)

The runtime package ships an Angular schematics collection (`packages/runtime/schematics/collection.json`). These are the primary developer onboarding paths:

- **`ng add @blotch/angular-lynx`** — transforms an existing `ng new` project into a Lynx-native app: rewrites `main.ts`, `app.config.ts`, `app.component.ts`, adds `lynx.config.ts`, and optionally installs Tailwind (`--tailwind=false` to skip)
- **`ng generate @blotch/angular-lynx:component <name>`** (alias `c`) — generates a standalone component with Lynx element templates, `ChangeDetectionStrategy.OnPush`, and a Vitest spec file; options: `--path`, `--prefix`, `--inlineStyle`, `--inlineTemplate`, `--skipTests`, `--flat`
- **`ng generate @blotch/angular-lynx:add-tailwind`** — adds `tailwind.config.ts` with `@lynx-js/tailwind-preset` and updates `styles.css`
- **`ng generate @blotch/angular-lynx:add-testing`** — adds `vitest.config.ts`, `src/setup.ts`, and installs `@blotch/angular-lynx-testing-library`
- **`ng generate @blotch/angular-lynx:add-i18n`** — adds `@angular/localize`, configures `angular.json` i18n, and injects `provideLocale()` into app config

## Build & Run

```sh
npm install && npm run build   # Build all packages
npm run demo                   # Start demo dev server (rspeedy)
```

## Debugging

The demo runs on-device (iPhone) — there is no browser console. To debug, render logs on screen using `<text>` elements instead of `console.log`.

## Lynx vs Web Differences

When you discover that Lynx behaves differently from the web platform in a non-obvious way, **add it to `investigations/lynx-vs-web-differences.md`**. This file is the canonical reference for Lynx gotchas encountered during development.

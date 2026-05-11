# demo-app — Example Lynx Angular Application

Example app demonstrating the runtime library. Uses standalone components, zoneless change detection, and Lynx native elements.

## Patterns

- **Standalone components** with `CUSTOM_ELEMENTS_SCHEMA` (required for Lynx elements)
- **Zoneless change detection** via `provideExperimentalZonelessChangeDetection()`
- **Signals** for reactive state
- **Lazy-loaded routes** — all route components use `loadComponent`
- Templates use Lynx elements: `<view>`, `<text>`, `<image>`, etc.

## Routes

| Path              | Component                   |
| ----------------- | --------------------------- |
| `/`               | `AppComponent`              |
| `/list-example`   | `ListExampleComponent`      |
| `/scroll-example` | `ScrollExampleComponent`    |
| `/showcase`       | `ElementsShowcaseComponent` |

## Key Files

```
lynx.config.ts                     # RSpeedy config using pluginAngularLynx()
src/
  main.ts                          # Entry point — bootstrapLynxApplication()
  app/
    app.config.ts                  # App config (zoneless CD + provideLynxRenderer())
    app.routes.ts                  # Route definitions (all lazy-loaded)
    app.component.ts               # Root component
    elements-showcase/             # Showcases all supported Lynx elements
    list-example/                  # list usage example
    scroll-example/                # scroll-view usage example
```

## Run

```sh
npm run demo    # Start dev server (rspeedy) — run from repo root
```

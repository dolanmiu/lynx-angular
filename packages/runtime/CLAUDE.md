# runtime — Angular Renderer2 → Lynx API Bridge

Provides everything needed to run Angular on the Lynx runtime. Maps Angular's `Renderer2` interface to Lynx global `__*` functions.

## Architecture Layers

**Document** (`lynx-document.ts`):

- `LynxDocument` (main thread) — wraps Lynx global `__Create*` functions (`__CreatePage`, `__CreateView`, `__CreateText`, `__CreateImage`, `__CreateScrollView`, `__CreateList`, `__CreateBlock`, `__CreateIf`, `__CreateFor`, `__CreateRawText`, `__CreateFrame`, `__CreateNonElement`)
- `LynxBackgroundDocument` (background thread) — creates virtual `LynxBackgroundElement` nodes with tag metadata
- `LynxDocumentBase` interface — shared contract for both

**Element** (`lynx-element.ts`):

- `BaseLynxElement` interface — common element API (setAttribute, setStyle, appendChild, insertBefore, remove, etc.)
- `LynxElement` (main thread) — wraps `ElementRef`, delegates to global `__*` functions (`__SetAttribute`, `__AddInlineStyle`, `__AppendElement`, `__InsertElementBefore`, `__RemoveElement`, `__AddEvent`, `__AddClass`, `__GetParent`, `__NextElement`, etc.)
- `LynxBackgroundElement` (background thread) — in-memory linked-list tree (no native calls), stores props/styles/classes in Maps/Sets

**Renderer** (`renderer.ts`):

- `LynxRenderer` implements `Renderer2` — delegates all DOM operations to `LynxDocumentBase`/`BaseLynxElement`

**Factory** (`lynx-renderer-factory2.ts`):

- `LynxRendererFactory2` implements `RendererFactory2` — injects `LYNX_DOCUMENT`, creates `LynxRenderer`

**Bootstrap** (`runtime.ts`):

- `bootstrapLynxApplication(rootComponent, config?)` — on main thread, waits for `renderPage` callback before bootstrapping; on background thread, bootstraps immediately
- Registers global Lynx callbacks: `renderPage`, `updatePage`, `processData`, `runWorklet`

**Providers** (`providers.ts`):

- `provideLynxRenderer()` — returns `EnvironmentProviders` that sets up `LYNX_DOCUMENT` (thread-aware factory: `LynxDocument` if `__MAIN_THREAD__`, else `LynxBackgroundDocument`) and `LynxRendererFactory2` as `RendererFactory2`

**DI Token** (`token.ts`):

- `LYNX_DOCUMENT` — `InjectionToken<LynxDocumentBase>` for thread-aware document injection

## Supported Lynx Elements

`page`, `view`, `text`, `image`, `scroll-view`, `list`, `block`, `if`, `for`, `raw-text`, `frame`, `input`, `textarea`, `overlay`, `svg`

`page` is special — it returns the existing root page element (created by `createRootElement()`), not a new element. Only one `<page>` is allowed per app. The element has `_isRootPageElement = true` which prevents Angular from reparenting or removing it.

Unknown tags fall back to `view` with a console warning.

## Key Files

```
src/
  public-api.ts                    # Public exports
  lib/
    renderer.ts                    # LynxRenderer (Renderer2 impl)
    lynx-renderer-factory2.ts      # LynxRendererFactory2 (RendererFactory2 impl)
    lynx-document.ts               # LynxDocument + LynxBackgroundDocument
    lynx-element.ts                # LynxElement + LynxBackgroundElement + BaseLynxElement
    runtime.ts                     # bootstrapLynxApplication(), global callbacks
    providers.ts                   # provideLynxRenderer()
    token.ts                       # LYNX_DOCUMENT injection token
    types/
      lynx.ts                      # Global Lynx API type declarations (__CreateElement, etc.)
      runtime-types.ts             # Runtime type definitions
```

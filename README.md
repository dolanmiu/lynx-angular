# Angular + Lynx Integration

This project provides both a runtime layer and a custom `rspeedy` plugin to enable Angular applications to run on the [Lynx](https://lynxjs.org/) runtime — a cross-platform native UI framework by ByteDance. Write Angular components with Lynx elements, and render to native mobile UI.

> 🚧 **Work in Progress**
> This is an early proof of concept. Only a minimal subset of Angular features is currently supported.

## Architecture

The project is a monorepo with three packages that map to the build-time and runtime stages of a Lynx app:

```mermaid
graph TB
    subgraph build ["Build Time"]
        direction TB
        src["demo-app<br/><i>Angular components using<br/>Lynx elements (x-view, x-text, ...)</i>"]
        plugin["@blotch/rsbuild-plugin-ng-lynx<br/><i>RSpeedy/Rsbuild plugin +<br/>Angular compiler (webpack)</i>"]
        bundle[".lynx.bundle<br/><i>main-thread JS + background-thread JS<br/>+ CSS + template</i>"]

        src --> plugin --> bundle
    end

    subgraph device ["Runtime (on device)"]
        direction TB
        engine["Lynx Engine<br/><i>C++ core + PrimJS</i>"]

        subgraph main ["Main Thread"]
            renderer["runtime<br/><i>LynxRenderer → Renderer2</i>"]
            globals["Global __* functions<br/><i>__CreateElement, __AppendElement,<br/>__SetAttribute, __AddEvent, ...</i>"]
            native["Native UI Elements"]

            renderer --> globals --> native
        end

        subgraph bg ["Background Thread"]
            bg_runtime["runtime<br/><i>LynxBackgroundDocument +<br/>LynxBackgroundElement</i>"]
            app_logic["App Logic<br/><i>change detection, signals,<br/>routing, event handling</i>"]

            app_logic --> bg_runtime
        end

        engine --> main
        engine --> bg
    end

    bundle --> engine

    subgraph dev ["Dev Flow"]
        direction LR
        dev_server["Dev Server<br/><i>rspeedy dev</i>"]
        explorer["Lynx Explorer App<br/><i>scan QR code</i>"]

        dev_server -- "serves bundle" --> explorer
    end

    explorer -- "embeds" --> engine
```

### Package Overview

| Package                 | Role                                                                                                                       | Key Files                                            |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **`packages/rsbuild-plugin-ng-lynx`** (`@blotch/rsbuild-plugin-ng-lynx`)  | RSpeedy build plugin — configures webpack with Angular compiler, splits code into main-thread and background-thread layers | `pluginNgLynx.ts`, `entry.ts`, `layers.ts`      |
| **`packages/runtime`**  | Angular `Renderer2` implementation that bridges to Lynx's global `__*` element APIs                                        | `renderer.ts`, `lynx-element.ts`, `lynx-document.ts` |
| **`packages/demo-app`** | Demo app with routing, signals, and Lynx native elements                                                                   | `lynx.config.ts`, `app.component.ts`                 |

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Project

```bash
npm run build
```

### 3. Run the Demo

```bash
npm run demo
```

You will need the [Lynx Explorer](https://lynxjs.org/guide/start/quick-start.html) app to scan the QR code and run the demo on your phone.

## Special Thanks Goes To

- [Angular](https://github.com/angular/angular)
- [Angular Rspack](https://github.com/nrwl/angular-rspack.git)
- [Lynx](https://github.com/lynx-family)

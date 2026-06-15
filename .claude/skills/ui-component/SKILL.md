---
name: ui-component
description: Create a new UI component in packages/ui and register it in packages/dolan so it can be scaffolded via `dolan add`. Use when creating, adding, or scaffolding a new Dolan UI component.
---

# Create a UI Component

When creating a new component in `packages/ui/`, you **must** also update `packages/dolan/` so it can be scaffolded via `dolan add <name>`.

## Steps

### 1. Create the component in `packages/ui`

Create a directory at `packages/ui/src/lib/components/<name>/` with:

- **`<name>.ts`** — The Angular component(s)/directive(s). Follow the pattern of existing components:
  - Standalone, `ViewEncapsulation.None`
  - Uses `LYNX_ELEMENTS` from `@blotch/angular-lynx`
  - Signal-based inputs (`input()`) and outputs (`output()`)
  - Accepts a `userClass` input aliased to `class`
  - Uses `cn()` from `../../utils/cn` for class merging
  - Uses `cva` from `class-variance-authority` for variants
  - Selector prefix: `ui-`

- **`index.ts`** — Re-exports all public symbols from `<name>.ts`

- Optional additional files (e.g. `<name>-state.ts` for state management)

### 2. Export from `packages/ui/src/index.ts`

Add a barrel export:

```typescript
export * from './lib/components/<name>';
```

### 3. Register in `packages/dolan/src/registry.ts`

Add an entry to the `registry` array:

```typescript
{ name: '<name>', dependencies: [] },
```

If the component imports other UI components (e.g. `UiSpinner`), list those as dependencies:

```typescript
{ name: '<name>', dependencies: ['spinner'] },
```

### 4. Verify

- The component files must only use relative imports to sibling files or `../../utils/cn`. The CLI's `rewriteImports` rewrites `../../utils/cn` to the user's configured utils path; other relative imports (like cross-component deps) should go through the dependency system.
- Cross-component imports must use the form `../<dep>/<dep>` (relative sibling path) so the CLI can resolve them when both are scaffolded into the user's project.
- Run tests to confirm the registry is correct:

```sh
npx turbo run test --filter=@blotch/dolan
```

## Checklist

- [ ] Component directory with `<name>.ts` and `index.ts`
- [ ] Exported from `packages/ui/src/index.ts`
- [ ] Entry added to `packages/dolan/src/registry.ts` with correct dependencies
- [ ] CLI tests pass

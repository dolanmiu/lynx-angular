# Examples

These examples consume UI components from `packages/ui/` via the `@blotch/dolan` scaffolding system.

## Keeping components in sync

When modifying a UI component in any example (`examples/*/src/components/ui/`), **always** apply the same change to the upstream source in `packages/ui/src/lib/components/`. The example copies are generated from upstream — they are not the source of truth.

After updating the upstream component in `packages/ui/`, run from the repo root:

```sh
npm run dolan:update:force
```

This propagates the upstream changes to all example copies across the monorepo.

## Rebuild after every change

After changing any file in an example, rebuild that example to confirm it still compiles. Only rebuild the one you touched — not all examples.

Each example is its own workspace named `@angular-lynx-example/<dir>`. Target it by directory name from the repo root:

```sh
npx turbo run build --filter=@angular-lynx-example/counter
```

The `build` script compiles both Lynx and web environments (`rspeedy build --environment lynx && rspeedy build --environment web`). If it fails, fix the example before moving on.

# Examples

These examples consume UI components from `packages/ui/` via the `@blotch/dolan` scaffolding system.

## Keeping components in sync

When modifying a UI component in any example (`examples/*/src/components/ui/`), **always** apply the same change to the upstream source in `packages/ui/src/lib/components/`. The example copies are generated from upstream — they are not the source of truth.

After updating the upstream component in `packages/ui/`, run from the repo root:

```sh
npm run dolan:update:force
```

This propagates the upstream changes to all example copies across the monorepo.

# Examples

These examples consume UI components from `packages/ui/` via the `@blotch/dolan` scaffolding system.

## Keeping components in sync

When modifying a UI component in any example (`examples/*/src/components/ui/`), **always** apply the same change to the upstream source in `packages/ui/src/lib/components/`. The example copies are generated from upstream — they are not the source of truth.

After updating the upstream component in `packages/ui/`, run from the repo root:

```sh
npm run dolan:update:force
```

This propagates the upstream changes to all example copies across the monorepo.

## Fixing examples via shared packages

Examples consume the shared packages under `packages/` — the renderer `@blotch/angular-lynx` (`packages/runtime`) and the build plugin `@blotch/rsbuild-plugin-angular-lynx` (`packages/rsbuild-plugin-angular-lynx`).

When an example is broken because of a bug in one of these packages, fix the package — not the example. Building workarounds in the example is not acceptable (see the "fix the renderer" goal in the root `CLAUDE.md`).

After editing a shared package, rebuild it so the examples pick up the change. Rebuild only the package you touched, by its package name from the repo root:

```sh
npx turbo run build --filter=@blotch/angular-lynx
```

Swap the filter for whichever package you changed (e.g. `--filter=@blotch/rsbuild-plugin-angular-lynx`). If the build fails, fix the package before retrying the example.

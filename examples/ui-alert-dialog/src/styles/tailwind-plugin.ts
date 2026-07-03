import plugin from 'tailwindcss/plugin';

/**
 * Tailwind plugin that maps @blotch/ui CSS variables to semantic color utilities.
 *
 * Usage in tailwind.config.ts:
 *   import { blotchPlugin } from '@blotch/ui/theme/tailwind-plugin';
 *   export default { plugins: [blotchPlugin] };
 *
 * Colors reference CSS variables DIRECTLY (`var(--x)`) rather than the shadcn/ui
 * pattern of wrapping raw HSL channels in `hsl(var(--x) / <alpha-value>)`. Lynx's
 * native CSS engine only parses comma-separated hsl(); Tailwind emits the
 * space-separated form `hsl(var(--x) / 1)`, which Lynx silently drops (colors
 * render transparent on device while looking fine in the web preview). Storing
 * complete rgba() values in the variables (see theme/default.css) and
 * referencing them directly avoids color-function parsing entirely. This matches
 * the official React Lynx Tailwind example.
 *
 * Tradeoff: Tailwind opacity modifiers on semantic colors (bg-primary/50) don't
 * work — the value is opaque with no separable channels. For the rare
 * translucent-semantic need, add a dedicated rgba() variable (see
 * `--destructive-subtle` → `destructive.subtle`) or use `opacity-*` on the element.
 */
export const blotchPlugin = plugin(
  ({ addBase }) => {
    addBase({
      '*': {
        'border-color': 'var(--border)',
      },
    });
  },
  {
    theme: {
      extend: {
        colors: {
          background: 'var(--background)',
          foreground: 'var(--foreground)',
          primary: {
            DEFAULT: 'var(--primary)',
            foreground: 'var(--primary-foreground)',
          },
          secondary: {
            DEFAULT: 'var(--secondary)',
            foreground: 'var(--secondary-foreground)',
          },
          muted: {
            DEFAULT: 'var(--muted)',
            foreground: 'var(--muted-foreground)',
          },
          accent: {
            DEFAULT: 'var(--accent)',
            foreground: 'var(--accent-foreground)',
          },
          destructive: {
            DEFAULT: 'var(--destructive)',
            foreground: 'var(--destructive-foreground)',
            // Pre-composed translucent red for subtle destructive backgrounds,
            // since bg-destructive/10 (opacity modifier) can't work here.
            subtle: 'var(--destructive-subtle)',
          },
          border: 'var(--border)',
          input: 'var(--input)',
          ring: 'var(--ring)',
          card: {
            DEFAULT: 'var(--card)',
            foreground: 'var(--card-foreground)',
          },
        },
        borderRadius: {
          lg: 'var(--radius)',
          md: 'calc(var(--radius) - 2px)',
          sm: 'calc(var(--radius) - 4px)',
        },
      },
    },
  },
);

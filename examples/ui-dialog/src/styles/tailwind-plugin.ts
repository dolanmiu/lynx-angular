import plugin from 'tailwindcss/plugin';

/**
 * Tailwind plugin that maps @blotch/ui CSS variables to semantic color utilities.
 *
 * Usage in tailwind.config.ts:
 *   import { blotchPlugin } from '@blotch/ui/theme/tailwind-plugin';
 *   export default { plugins: [blotchPlugin] };
 */
export const blotchPlugin = plugin(
  ({ addBase }) => {
    addBase({
      '*': {
        'border-color': 'rgb(var(--border))',
      },
    });
  },
  {
    theme: {
      extend: {
        // Colors compose the RGB channel variables (see theme/default.css) as
        // `rgb(var(--x) / <alpha-value>)`. Lynx's native parser accepts this
        // space + slash-alpha rgb() form (same shape as Tailwind's default
        // palette) but silently drops the equivalent hsl() form, so rgb() is
        // what makes semantic color utilities render on Lynx.
        colors: {
          background: 'rgb(var(--background) / <alpha-value>)',
          foreground: 'rgb(var(--foreground) / <alpha-value>)',
          primary: {
            DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
            foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
          },
          secondary: {
            DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
            foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)',
          },
          muted: {
            DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
            foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
          },
          accent: {
            DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
            foreground: 'rgb(var(--accent-foreground) / <alpha-value>)',
          },
          destructive: {
            DEFAULT: 'rgb(var(--destructive) / <alpha-value>)',
            foreground: 'rgb(var(--destructive-foreground) / <alpha-value>)',
          },
          border: 'rgb(var(--border) / <alpha-value>)',
          input: 'rgb(var(--input) / <alpha-value>)',
          ring: 'rgb(var(--ring) / <alpha-value>)',
          card: {
            DEFAULT: 'rgb(var(--card) / <alpha-value>)',
            foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
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

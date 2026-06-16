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
        'border-color': 'hsl(var(--border))',
      },
    });
  },
  {
    theme: {
      extend: {
        colors: {
          background: 'hsl(var(--background) / <alpha-value>)',
          foreground: 'hsl(var(--foreground) / <alpha-value>)',
          primary: {
            DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
            foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
          },
          secondary: {
            DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
            foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
          },
          muted: {
            DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
            foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
          },
          accent: {
            DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
            foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
          },
          destructive: {
            DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
            foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
          },
          border: 'hsl(var(--border) / <alpha-value>)',
          input: 'hsl(var(--input) / <alpha-value>)',
          ring: 'hsl(var(--ring) / <alpha-value>)',
          card: {
            DEFAULT: 'hsl(var(--card) / <alpha-value>)',
            foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
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

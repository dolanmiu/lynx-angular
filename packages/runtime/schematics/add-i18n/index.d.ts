import { type Rule } from '@angular-devkit/schematics';
import type { Schema } from './schema';
/**
 * Wires Angular's `@angular/localize` package into an AngularLynx app and
 * provides the Lynx-aware `provideLocale()` provider that reads the active
 * locale from Lynx's SystemInfo.
 *
 * Four-step setup, each step idempotent so re-running is safe:
 *   1. **angular.json `i18n` block** — declares the source locale so any
 *      `ng extract-i18n` runs produce the right XLIFF.
 *   2. **`@angular/localize/init` polyfill** — must run before the app boots
 *      so the global `$localize` function exists when components are
 *      instantiated.
 *   3. **tsconfig `types`** — adds @angular/localize so $localize is typed
 *      and TypeScript doesn't flag it as an undefined global.
 *   4. **provideLocale() in app.config** — registers the runtime provider
 *      that reads SystemInfo.language / appLocale and applies it to Angular's
 *      LOCALE_ID token.
 */
declare const _default: (options: Schema) => Rule;
export default _default;

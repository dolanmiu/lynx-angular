import { computed, inject, Injectable } from '@angular/core';
import { LynxGlobalDataService } from '../data-flow/global-data.service';

/**
 * Provides reactive access to the current locale on Lynx.
 *
 * Reads `lynx.__globalProps.appLocale` (set by the native host). Falls back to
 * the `sourceLocale` from angular.json (injected as `__LYNX_SOURCE_LOCALE__`
 * at build time), then to `'en-US'`.
 *
 * @usageNotes
 * ```typescript
 * const locale = inject(LynxLocaleService);
 *
 * // Reactive in templates
 * template: `<text>Current locale: {{ locale.locale() }}</text>`
 *
 * // For LOCALE_ID integration, add provideLocale() to your app config
 * ```
 */
@Injectable({ providedIn: 'root' })
export class LynxLocaleService {
  readonly #globalData = inject(LynxGlobalDataService);

  /** The current locale. Reactive — updates when global props change. */
  readonly locale = computed(() => {
    const value = (this.#globalData.globalData() as Record<string, unknown>)[
      'appLocale'
    ];
    if (typeof value === 'string' && value) {
      return value;
    }
    // Fall back to the compile-time source locale from angular.json
    return typeof __LYNX_SOURCE_LOCALE__ !== 'undefined'
      ? __LYNX_SOURCE_LOCALE__
      : 'en-US';
  });
}

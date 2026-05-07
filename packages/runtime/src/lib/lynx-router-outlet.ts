import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { type ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

/**
 * Lynx-compatible replacement for Angular's `RouterOutlet`.
 *
 * Angular's native `RouterOutlet` uses `ViewContainerRef.createComponent()`
 * which fails in Lynx. This component uses content projection instead —
 * the developer provides route rendering via `@switch` inside the outlet,
 * which uses Angular's `createEmbeddedView()` path (proven to work in Lynx).
 *
 * Usage mirrors React Lynx's `<Routes><Route element={…} />` pattern:
 *
 * ```typescript
 * imports: [LynxRouterOutlet, ListComponent, ShowcaseComponent]
 * template: `
 *   <router-outlet #o>
 *     @switch (o.route()) {
 *       @case ('list') { <app-list /> }
 *       @case ('showcase') { <app-showcase /> }
 *     }
 *   </router-outlet>
 * `
 * ```
 *
 * Route config (`app.routes.ts`) still drives URL matching, redirects, and guards.
 */
@Component({
  selector: 'router-outlet',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: '<ng-content />',
})
export class LynxRouterOutlet {
  readonly #router = inject(Router);
  readonly #destroyRef = inject(DestroyRef);

  /** The path of the currently matched route (e.g. `'list-example'`). */
  readonly route = signal('');

  constructor() {
    this.#syncFromRouter();

    this.#router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe(() => this.#syncFromRouter());
  }

  #syncFromRouter(): void {
    let r: ActivatedRoute | null = this.#router.routerState.root;
    while (r?.firstChild) {
      r = r.firstChild;
    }
    const path = r?.routeConfig?.path ?? '';
    this.route.set(path);
  }
}

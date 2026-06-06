import {
  Component,
  contentChild,
  effect,
  type EmbeddedViewRef,
  inject,
  input,
  output,
  Renderer2,
  TemplateRef,
  viewChild,
  ViewContainerRef,
} from '@angular/core';

type ViewEntry<T> = {
  viewRef: EmbeddedViewRef<{ $implicit: T }>;
  item: T;
  leaving: boolean;
  leaveRaf: number | null;
  leaveTimer: ReturnType<typeof setTimeout> | null;
};

/**
 * Animates enter/leave of list items using CSS transitions.
 *
 * Unlike `LynxTransition` (single element), this manages a collection.
 * Items are rendered from a user-provided `<ng-template>`, and the component
 * diffs the list on each change to animate additions and removals.
 *
 * Follows the same CSS class convention as `LynxTransition` and Vue's
 * `<TransitionGroup>`.
 *
 * @usageNotes
 * ```html
 * <lynx-transition-group [each]="items()" [trackBy]="idFn" name="list" [duration]="300">
 *   <ng-template let-item>
 *     <view>
 *       <text>{{ item.name }}</text>
 *     </view>
 *   </ng-template>
 * </lynx-transition-group>
 * ```
 *
 * ```css
 * .list-enter-active, .list-leave-active {
 *   transition: opacity 300ms, transform 300ms;
 * }
 * .list-enter-from { opacity: 0; transform: translateX(30px); }
 * .list-leave-to { opacity: 0; transform: translateX(-30px); }
 * ```
 */
@Component({
  selector: 'lynx-transition-group',
  standalone: true,
  template: `<ng-template #anchor />`,
})
export class LynxTransitionGroup<T> {
  readonly each = input<T[]>([]);
  readonly trackBy = input<(item: T) => unknown>((item: any) => item);
  readonly name = input<string>('v');
  readonly duration = input<number>(300);

  readonly afterEnter = output<T>();
  readonly afterLeave = output<T>();

  readonly itemTemplate = contentChild(TemplateRef);

  protected readonly vcr = viewChild.required('anchor', {
    read: ViewContainerRef,
  });

  readonly #renderer = inject(Renderer2);
  #entries = new Map<unknown, ViewEntry<T>>();
  #initialized = false;

  constructor() {
    effect(() => {
      const items = this.each();
      const trackBy = this.trackBy();

      if (!this.#initialized) {
        this.#initialized = true;
        this.#initialRender(items, trackBy);
        return;
      }

      this.#reconcile(items, trackBy);
    });
  }

  #initialRender(items: T[], trackBy: (item: T) => unknown): void {
    const template = this.itemTemplate();
    if (!template) return;
    for (const item of items) {
      const key = trackBy(item);
      const viewRef = this.vcr().createEmbeddedView(template, {
        $implicit: item,
      });
      this.#entries.set(key, {
        viewRef,
        item,
        leaving: false,
        leaveRaf: null,
        leaveTimer: null,
      });
    }
  }

  #reconcile(items: T[], trackBy: (item: T) => unknown): void {
    const newKeys = new Set<unknown>();
    const newKeyOrder: unknown[] = [];

    for (const item of items) {
      const key = trackBy(item);
      newKeys.add(key);
      newKeyOrder.push(key);
    }

    // Leave: entries not in new list.
    for (const [key, entry] of this.#entries) {
      if (!newKeys.has(key) && !entry.leaving) {
        this.#animateLeave(key, entry);
      } else if (newKeys.has(key) && entry.leaving) {
        // Item reappeared — cancel leave.
        this.#cancelLeave(key, entry);
      }
    }

    // Enter: items in new list but not in entries (or was leaving).
    const template = this.itemTemplate();
    if (!template) return;
    for (const item of items) {
      const key = trackBy(item);
      const existing = this.#entries.get(key);

      if (!existing) {
        const viewRef = this.vcr().createEmbeddedView(template, {
          $implicit: item,
        });
        const entry: ViewEntry<T> = {
          viewRef,
          item,
          leaving: false,
          leaveRaf: null,
          leaveTimer: null,
        };
        this.#entries.set(key, entry);
        this.#animateEnter(entry);
      } else if (!existing.leaving) {
        // Update context for retained items.
        existing.item = item;
        existing.viewRef.context.$implicit = item;
        existing.viewRef.markForCheck();
      }
    }

    // Reorder non-leaving views to match new list order.
    this.#reorderViews(newKeyOrder);
  }

  #reorderViews(keyOrder: unknown[]): void {
    let insertIndex = 0;
    for (const key of keyOrder) {
      const entry = this.#entries.get(key);
      if (!entry || entry.leaving) continue;

      const currentIndex = this.vcr().indexOf(entry.viewRef);
      if (currentIndex !== insertIndex) {
        this.vcr().move(entry.viewRef, insertIndex);
      }
      insertIndex++;
    }
  }

  #animateEnter(entry: ViewEntry<T>): void {
    const rootEl = entry.viewRef.rootNodes[0];
    if (!rootEl) return;

    const name = this.name();
    const duration = this.duration();

    this.#renderer.addClass(rootEl, `${name}-enter-from`);
    this.#renderer.addClass(rootEl, `${name}-enter-active`);

    requestAnimationFrame(() => {
      this.#renderer.removeClass(rootEl, `${name}-enter-from`);
      this.#renderer.addClass(rootEl, `${name}-enter-to`);

      setTimeout(() => {
        this.#renderer.removeClass(rootEl, `${name}-enter-active`);
        this.#renderer.removeClass(rootEl, `${name}-enter-to`);
        this.afterEnter.emit(entry.item);
      }, duration);
    });
  }

  #animateLeave(key: unknown, entry: ViewEntry<T>): void {
    entry.leaving = true;

    const rootEl = entry.viewRef.rootNodes[0];
    if (!rootEl) {
      this.#destroyEntry(key);
      return;
    }

    const name = this.name();
    const duration = this.duration();

    this.#renderer.addClass(rootEl, `${name}-leave-from`);
    this.#renderer.addClass(rootEl, `${name}-leave-active`);

    entry.leaveRaf = requestAnimationFrame(() => {
      entry.leaveRaf = null;
      this.#renderer.removeClass(rootEl, `${name}-leave-from`);
      this.#renderer.addClass(rootEl, `${name}-leave-to`);

      entry.leaveTimer = setTimeout(() => {
        entry.leaveTimer = null;
        const item = entry.item;
        this.#destroyEntry(key);
        this.afterLeave.emit(item);
      }, duration);
    });
  }

  #cancelLeave(_key: unknown, entry: ViewEntry<T>): void {
    if (entry.leaveRaf !== null) {
      cancelAnimationFrame(entry.leaveRaf);
      entry.leaveRaf = null;
    }
    if (entry.leaveTimer !== null) {
      clearTimeout(entry.leaveTimer);
      entry.leaveTimer = null;
    }

    const rootEl = entry.viewRef.rootNodes[0];
    if (rootEl) {
      const name = this.name();
      this.#renderer.removeClass(rootEl, `${name}-leave-from`);
      this.#renderer.removeClass(rootEl, `${name}-leave-active`);
      this.#renderer.removeClass(rootEl, `${name}-leave-to`);
    }

    entry.leaving = false;
  }

  #destroyEntry(key: unknown): void {
    const entry = this.#entries.get(key);
    if (!entry) return;

    const index = this.vcr().indexOf(entry.viewRef);
    if (index >= 0) {
      this.vcr().remove(index);
    }
    this.#entries.delete(key);
  }
}

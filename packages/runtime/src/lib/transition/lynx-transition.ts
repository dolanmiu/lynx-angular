import {
  Component,
  effect,
  ElementRef,
  inject,
  input,
  output,
  Renderer2,
  signal,
} from '@angular/core';

/**
 * Animates the enter/leave of projected content using CSS transitions.
 *
 * Follows the same CSS class convention as Vue's `<Transition>`:
 *
 * | Phase        | Classes applied                                  |
 * |--------------|--------------------------------------------------|
 * | Enter start  | `{name}-enter-from`, `{name}-enter-active`       |
 * | Enter active | `{name}-enter-to`, `{name}-enter-active`         |
 * | Leave start  | `{name}-leave-from`, `{name}-leave-active`       |
 * | Leave active | `{name}-leave-to`, `{name}-leave-active`         |
 *
 * Uses timer-based completion (setTimeout) instead of transitionend events
 * because the Lynx background thread has no access to CSS computed values —
 * transitionend fires on the native main thread but there's no bridge to
 * deliver it to the JS background thread. The `duration` input (default 300ms)
 * must match your CSS transition length (same constraint as Vue Lynx).
 *
 * @usageNotes
 * ```html
 * <lynx-transition [show]="isVisible()" name="fade" [duration]="300">
 *   <view class="panel">
 *     <text>Hello</text>
 *   </view>
 * </lynx-transition>
 * ```
 *
 * ```css
 * .fade-enter-active, .fade-leave-active {
 *   transition-property: opacity;
 *   transition-duration: 300ms;
 * }
 * .fade-enter-from, .fade-leave-to {
 *   opacity: 0;
 * }
 * ```
 */
@Component({
  selector: 'lynx-transition',
  standalone: true,
  template: `@if (shouldRender()) {
    <ng-content />
  }`,
})
export class LynxTransition {
  readonly show = input<boolean>(false);
  readonly name = input<string>('v');
  readonly duration = input<number>(300);

  readonly afterEnter = output<void>();
  readonly afterLeave = output<void>();

  readonly shouldRender = signal(false);

  readonly #renderer = inject(Renderer2);
  readonly #el = inject(ElementRef);
  #initialized = false;
  #leaveTimer: ReturnType<typeof setTimeout> | null = null;
  #enterTimer: ReturnType<typeof setTimeout> | null = null;
  #enterRaf: number | null = null;
  #leaveRaf: number | null = null;

  constructor() {
    effect(() => {
      const show = this.show();

      if (!this.#initialized) {
        this.#initialized = true;
        this.shouldRender.set(show);
        return;
      }

      if (show) {
        this.#enter();
      } else {
        this.#leave();
      }
    });
  }

  #enter(): void {
    this.#cancelLeave();

    const el = this.#el.nativeElement;
    const name = this.name();
    const duration = this.duration();

    this.#renderer.addClass(el, `${name}-enter-from`);
    this.#renderer.addClass(el, `${name}-enter-active`);
    this.shouldRender.set(true);

    this.#enterRaf = requestAnimationFrame(() => {
      this.#enterRaf = null;
      this.#renderer.removeClass(el, `${name}-enter-from`);
      this.#renderer.addClass(el, `${name}-enter-to`);

      this.#enterTimer = setTimeout(() => {
        this.#enterTimer = null;
        this.#renderer.removeClass(el, `${name}-enter-active`);
        this.#renderer.removeClass(el, `${name}-enter-to`);
        this.afterEnter.emit();
      }, duration);
    });
  }

  #leave(): void {
    this.#cancelEnter();

    const el = this.#el.nativeElement;
    const name = this.name();
    const duration = this.duration();

    this.#renderer.addClass(el, `${name}-leave-from`);
    this.#renderer.addClass(el, `${name}-leave-active`);

    this.#leaveRaf = requestAnimationFrame(() => {
      this.#leaveRaf = null;
      this.#renderer.removeClass(el, `${name}-leave-from`);
      this.#renderer.addClass(el, `${name}-leave-to`);

      this.#leaveTimer = setTimeout(() => {
        this.#leaveTimer = null;
        this.shouldRender.set(false);
        this.#renderer.removeClass(el, `${name}-leave-active`);
        this.#renderer.removeClass(el, `${name}-leave-to`);
        this.afterLeave.emit();
      }, duration);
    });
  }

  #cancelEnter(): void {
    if (this.#enterRaf !== null) {
      cancelAnimationFrame(this.#enterRaf);
      this.#enterRaf = null;
    }
    if (this.#enterTimer !== null) {
      clearTimeout(this.#enterTimer);
      this.#enterTimer = null;
    }
    const el = this.#el.nativeElement;
    const name = this.name();
    this.#renderer.removeClass(el, `${name}-enter-from`);
    this.#renderer.removeClass(el, `${name}-enter-active`);
    this.#renderer.removeClass(el, `${name}-enter-to`);
  }

  #cancelLeave(): void {
    if (this.#leaveRaf !== null) {
      cancelAnimationFrame(this.#leaveRaf);
      this.#leaveRaf = null;
    }
    if (this.#leaveTimer !== null) {
      clearTimeout(this.#leaveTimer);
      this.#leaveTimer = null;
    }
    const el = this.#el.nativeElement;
    const name = this.name();
    this.#renderer.removeClass(el, `${name}-leave-from`);
    this.#renderer.removeClass(el, `${name}-leave-active`);
    this.#renderer.removeClass(el, `${name}-leave-to`);
  }
}

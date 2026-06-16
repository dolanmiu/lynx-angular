import type { ElementRef } from '@angular/core';
import {
  Component,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

import {
  type AnimationHandle,
  DURATION,
  EASING,
  directionalSlideIn,
  revealIn,
} from '../../utils/animate';
import { cn } from '../../utils/cn';

@Component({
  selector: 'ui-tabs',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view [class]="containerClass()">
      <ng-content />
    </view>
  `,
})
export class UiTabs {
  readonly value = model<string>('');
  readonly userClass = input<string>('', { alias: 'class' });

  readonly changed = output<string>();

  // Direction tracking: determines whether content slides left or right
  readonly #tabOrder: string[] = [];
  #previousValue: string | undefined;
  readonly direction = signal<1 | -1>(1);

  protected readonly containerClass = computed(() =>
    cn('flex flex-col', this.userClass()),
  );

  constructor() {
    // Reactively compute direction when the active value changes.
    // This handles both internal select() calls and external model changes.
    effect(() => {
      const currentValue = this.value();
      if (this.#previousValue === undefined) {
        this.#previousValue = currentValue;
        return;
      }
      if (currentValue === this.#previousValue) return;

      const prevIndex = this.#tabOrder.indexOf(this.#previousValue);
      const nextIndex = this.#tabOrder.indexOf(currentValue);
      if (prevIndex !== -1 && nextIndex !== -1 && prevIndex !== nextIndex) {
        this.direction.set(nextIndex > prevIndex ? 1 : -1);
      }
      this.#previousValue = currentValue;
    });
  }

  /** Called by UiTabsTrigger to register ordering for direction detection. */
  registerTab(value: string): void {
    if (!this.#tabOrder.includes(value)) {
      this.#tabOrder.push(value);
    }
  }

  select(value: string): void {
    this.value.set(value);
    this.changed.emit(value);
  }
}

@Component({
  selector: 'ui-tabs-list',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view [class]="listClass()">
      <ng-content />
    </view>
  `,
})
export class UiTabsList {
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly listClass = computed(() =>
    cn('flex flex-row items-center rounded-lg bg-muted p-1', this.userClass()),
  );
}

@Component({
  selector: 'ui-tabs-trigger',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view #trigger [class]="triggerClass()" (bindtap)="select()">
      <text [class]="textClass()"><ng-content /></text>
    </view>
  `,
})
export class UiTabsTrigger {
  readonly #tabs = inject(UiTabs);

  readonly triggerValue = input.required<string>({ alias: 'value' });
  readonly userClass = input<string>('', { alias: 'class' });

  readonly triggerRef = viewChild<ElementRef>('trigger');
  #anim?: AnimationHandle;
  #previousActive?: boolean;

  protected readonly isActive = computed(
    () => this.#tabs.value() === this.triggerValue(),
  );

  constructor() {
    // Register this trigger with the parent for direction detection
    effect(() => {
      this.#tabs.registerTab(this.triggerValue());
    });

    // Animate trigger background on selection change
    effect(() => {
      const active = this.isActive();
      const el = this.triggerRef()?.nativeElement;
      if (!el || this.#previousActive === undefined) {
        this.#previousActive = active;
        return;
      }
      if (active === this.#previousActive) return;
      this.#previousActive = active;

      this.#anim?.cancel();

      if (active) {
        // Activation: spring-based scale + opacity for a lively entrance
        this.#anim = el.animate(
          [
            { transform: 'scaleX(0.95)', opacity: 0.7 },
            { transform: 'scaleX(1)', opacity: 1 },
          ],
          {
            duration: DURATION.normal,
            easing: EASING.springSubtle,
            fill: 'forwards',
          },
        );
      } else {
        // Deactivation: quick shrink + fade for a graceful exit
        this.#anim = el.animate(
          [
            { transform: 'scaleX(1)', opacity: 1 },
            { transform: 'scaleX(0.97)', opacity: 0.7 },
          ],
          {
            duration: DURATION.fast,
            easing: EASING.accelerate,
            fill: 'forwards',
          },
        );
      }
    });
  }

  protected readonly triggerClass = computed(() =>
    cn(
      'flex-1 flex items-center justify-center rounded-sm px-3 py-1.5',
      this.isActive() ? 'bg-background' : 'bg-transparent',
      this.userClass(),
    ),
  );

  protected readonly textClass = computed(() =>
    cn(
      'text-sm font-medium',
      this.isActive() ? 'text-foreground' : 'text-muted-foreground',
    ),
  );

  select(): void {
    this.#tabs.select(this.triggerValue());
  }
}

@Component({
  selector: 'ui-tabs-content',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (isActive()) {
      <view #content [class]="contentClass()">
        <ng-content />
      </view>
    }
  `,
})
export class UiTabsContent {
  readonly #tabs = inject(UiTabs);

  readonly contentValue = input.required<string>({ alias: 'value' });
  readonly userClass = input<string>('', { alias: 'class' });

  readonly contentRef = viewChild<ElementRef>('content');
  #anim?: AnimationHandle;
  #isFirstRender = true;

  protected readonly isActive = computed(
    () => this.#tabs.value() === this.contentValue(),
  );

  constructor() {
    // Animate content reveal when tab becomes active
    effect(() => {
      if (!this.isActive()) return;
      // Small delay to let the DOM render the content view
      setTimeout(() => {
        const el = this.contentRef()?.nativeElement;
        if (!el) return;

        this.#anim?.cancel();

        if (this.#isFirstRender) {
          // First render: subtle vertical reveal (no directional context yet)
          this.#isFirstRender = false;
          this.#anim = revealIn(el, { fromY: 6, duration: DURATION.normal });
        } else {
          // Subsequent renders: direction-aware horizontal slide
          const dir = this.#tabs.direction();
          this.#anim = directionalSlideIn(el, dir, {
            distance: 24,
            duration: 300,
          });
        }
      }, 0);
    });
  }

  protected readonly contentClass = computed(() =>
    cn('flex flex-col mt-2', this.userClass()),
  );
}

import {
  type ElementRef,
  Component,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

import { type AnimationHandle, revealIn } from '../../utils/animate';
import { cn } from '../../utils/cn';

@Component({
  selector: 'ui-collapsible',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view [class]="containerClass()">
      <ng-content />
    </view>
  `,
})
export class UiCollapsible {
  readonly open = model(false);
  readonly disabled = input(false);
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly containerClass = computed(() =>
    cn('flex-col flex', this.userClass()),
  );

  toggle(): void {
    if (!this.disabled()) {
      this.open.update((v) => !v);
    }
  }
}

@Component({
  selector: 'ui-collapsible-trigger',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view [class]="triggerClass()" (bindtap)="onTap()">
      <ng-content />
    </view>
  `,
})
export class UiCollapsibleTrigger {
  readonly #collapsible = inject(UiCollapsible);
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly triggerClass = computed(() =>
    cn(
      'flex-row items-center flex',
      this.#collapsible.disabled() && 'opacity-50',
      this.userClass(),
    ),
  );

  protected onTap(): void {
    this.#collapsible.toggle();
  }
}

@Component({
  selector: 'ui-collapsible-content',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  // Inline style="opacity: 1; transform: translateY(0);" is the resting state
  // fallback. The revealIn animation starts from opacity:0 / translateY(-8px)
  // and animates to the final state. Using fill:'none' means the animation
  // doesn't persist its values — the inline style takes over once it ends.
  // This prevents the element from being invisible if the animation fails to
  // start (which previously happened on the second expand cycle due to stale
  // pool state in Lynx's native element recycling).
  template: `
    @if (collapsible.open()) {
      <view
        #content
        [class]="contentClass()"
        style="opacity: 1; transform: translateY(0);"
      >
        <ng-content />
      </view>
    }
  `,
})
export class UiCollapsibleContent {
  protected readonly collapsible = inject(UiCollapsible);
  readonly userClass = input<string>('', { alias: 'class' });

  readonly contentRef = viewChild<ElementRef>('content');
  #anim?: AnimationHandle;

  constructor() {
    effect(() => {
      const el = this.contentRef()?.nativeElement;
      if (!el) {
        this.#anim = undefined;
        return;
      }
      if (this.collapsible.open()) {
        this.#anim?.cancel();
        // Delay animation to next microtask so the element is fully committed
        // to Lynx's native tree (via __FlushElementTree in end()) before the
        // animation starts. Starting animation in the same flush batch as
        // element creation causes the newly-pooled native element to not
        // render the animation on the second cycle — the element appears
        // permanently invisible (opacity stuck at the FROM keyframe: 0).
        // The microtask fires AFTER __FlushElementTree() in end(), so the
        // native element exists and is rendered before animation begins.
        queueMicrotask(() => {
          // Guard: the element may have been destroyed (collapsed) before
          // this microtask fires. Re-check identity to avoid animating
          // a dead or replaced element.
          if (this.contentRef()?.nativeElement === el) {
            this.#anim = revealIn(el, { fromY: -8, fill: 'none' });
          }
        });
      }
    });
  }

  protected readonly contentClass = computed(() =>
    cn('flex-col flex', this.userClass()),
  );
}

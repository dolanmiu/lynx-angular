import {
  type ElementRef,
  Component,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

import { type AnimationHandle, revealIn } from '@blotch/dolan/utils/animate';
import { cn } from '@blotch/dolan/utils/cn';

@Component({
  selector: 'ui-accordion',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view [class]="containerClass()">
      <ng-content />
    </view>
  `,
})
export class UiAccordion {
  readonly type = input<'single' | 'multiple'>('single');
  readonly userClass = input<string>('', { alias: 'class' });

  readonly expandedItems = signal<Set<string>>(new Set());

  protected readonly containerClass = computed(() =>
    cn('flex flex-col', this.userClass()),
  );

  toggle(value: string): void {
    // `new Set(current)` creates a fresh Set on every toggle. Angular signals
    // use reference equality — mutating the existing Set in-place wouldn't
    // trigger change detection since the signal value (the Set reference) stays
    // the same. A new Set forces the signal to see a changed reference.
    const current = new Set(this.expandedItems());
    if (current.has(value)) {
      current.delete(value);
    } else {
      if (this.type() === 'single') {
        current.clear();
      }
      current.add(value);
    }
    this.expandedItems.set(current);
  }

  isExpanded(value: string): boolean {
    return this.expandedItems().has(value);
  }
}

@Component({
  selector: 'ui-accordion-item',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view [class]="itemClass()">
      <ng-content />
    </view>
  `,
})
export class UiAccordionItem {
  readonly #accordion = inject(UiAccordion);

  readonly itemValue = input.required<string>({ alias: 'value' });
  readonly userClass = input<string>('', { alias: 'class' });

  readonly isExpanded = computed(() =>
    this.#accordion.expandedItems().has(this.itemValue()),
  );

  protected readonly itemClass = computed(() =>
    cn('flex flex-col border-b border-border', this.userClass()),
  );

  toggle(): void {
    this.#accordion.toggle(this.itemValue());
  }
}

@Component({
  selector: 'ui-accordion-trigger',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view [class]="triggerClass()" (bindtap)="onTap()">
      <text [class]="textClass()"><ng-content /></text>
      <text [class]="chevronClass()">{{ item.isExpanded() ? '▼' : '▶' }}</text>
    </view>
  `,
})
export class UiAccordionTrigger {
  protected readonly item = inject(UiAccordionItem);
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly triggerClass = computed(() =>
    cn('flex flex-row items-center justify-between py-4', this.userClass()),
  );

  protected readonly textClass = computed(() =>
    cn('text-sm font-medium text-foreground'),
  );

  protected readonly chevronClass = computed(() =>
    cn('text-xs text-muted-foreground'),
  );

  protected onTap(): void {
    this.item.toggle();
  }
}

@Component({
  selector: 'ui-accordion-content',
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
    @if (item.isExpanded()) {
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
export class UiAccordionContent {
  protected readonly item = inject(UiAccordionItem);
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
      if (this.item.isExpanded()) {
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
    cn('flex flex-col pb-4', this.userClass()),
  );
}

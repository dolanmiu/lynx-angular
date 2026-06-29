import {
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

import { cn } from '../../utils/cn';

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

/**
 * Animation removed due to two stacked Lynx iOS bugs:
 * 1. <ng-content> inside @if: elements trapped in a removed subtree become
 *    permanently dead on Lynx (fixed in the renderer's remove() — children
 *    are now parked at the page root before removal).
 * 2. element.animate() on the @if container view: even with the renderer fix,
 *    calling animate() on a view that gets destroyed/recreated by @if leaves
 *    the new view's opacity stuck at 0 (the animation's initial keyframe).
 *    This is a separate Lynx bug where animation state leaks across element
 *    lifecycle boundaries. Without animation, content projection works reliably.
 */
@Component({
  selector: 'ui-accordion-content',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (item.isExpanded()) {
      <view [class]="contentClass()">
        <ng-content />
      </view>
    }
  `,
})
export class UiAccordionContent {
  protected readonly item = inject(UiAccordionItem);
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly contentClass = computed(() =>
    cn('flex flex-col pb-4', this.userClass()),
  );
}

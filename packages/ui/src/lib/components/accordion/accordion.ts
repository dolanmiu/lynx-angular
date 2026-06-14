import type { ElementRef } from '@angular/core';
import {
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
    cn(
      'flex flex-row items-center justify-between py-4 active:opacity-80',
      this.userClass(),
    ),
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
  template: `
    @if (item.isExpanded()) {
      <view #content [class]="contentClass()">
        <ng-content />
      </view>
    }
  `,
})
export class UiAccordionContent {
  protected readonly item = inject(UiAccordionItem);
  readonly userClass = input<string>('', { alias: 'class' });

  readonly contentRef = viewChild<ElementRef>('content');

  constructor() {
    effect(() => {
      const el = this.contentRef()?.nativeElement;
      if (el && this.item.isExpanded()) {
        el.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 200,
          easing: 'ease-out',
          fill: 'forwards',
        });
      }
    });
  }

  protected readonly contentClass = computed(() =>
    cn('flex flex-col pb-4', this.userClass()),
  );
}

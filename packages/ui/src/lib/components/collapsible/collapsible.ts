import type { ElementRef } from '@angular/core';
import {
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
    cn('flex flex-col', this.userClass()),
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
      'flex flex-row items-center active:opacity-80',
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
  template: `
    @if (collapsible.open()) {
      <view #content [class]="contentClass()">
        <ng-content />
      </view>
    }
  `,
})
export class UiCollapsibleContent {
  protected readonly collapsible = inject(UiCollapsible);
  readonly userClass = input<string>('', { alias: 'class' });

  readonly contentRef = viewChild<ElementRef>('content');

  constructor() {
    effect(() => {
      const el = this.contentRef()?.nativeElement;
      if (el && this.collapsible.open()) {
        el.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 200,
          easing: 'ease-out',
          fill: 'forwards',
        });
      }
    });
  }

  protected readonly contentClass = computed(() =>
    cn('flex flex-col', this.userClass()),
  );
}

import { type ElementRef, Component, ViewEncapsulation, computed, effect, inject, input, model, viewChild } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

import { type AnimationHandle, revealIn } from '@blotch/dolan/utils/animate';
import { cn } from '@blotch/dolan/utils/cn';

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
      'flex flex-row items-center',
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
        this.#anim = revealIn(el, { fromY: -8, fill: 'none' });
      }
    });
  }

  protected readonly contentClass = computed(() =>
    cn('flex flex-col', this.userClass()),
  );
}

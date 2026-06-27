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
  #anim?: AnimationHandle;

  constructor() {
    effect(() => {
      const el = this.contentRef()?.nativeElement;
      if (el && this.collapsible.open()) {
        // fromY: -8 makes content slide DOWN into view (starting 8px above its
        // final position), which matches the visual expectation of an accordion
        // opening downward. The animation only plays on open — on close, the
        // @if block removes the element from the tree, so no exit animation needed.
        this.#anim?.cancel();
        this.#anim = revealIn(el, { fromY: -8 });
      }
    });
  }

  protected readonly contentClass = computed(() =>
    cn('flex flex-col', this.userClass()),
  );
}

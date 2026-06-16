import type { ElementRef } from '@angular/core';
import {
  Component,
  ViewEncapsulation,
  computed,
  effect,
  input,
  viewChild,
} from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

import { DURATION, fadeIn, popIn } from '../../utils/animate';
import { cn } from '../../utils/cn';
import { type IconName } from '../icon/icons';
import { UiIcon } from '../icon/icon';

@Component({
  selector: 'ui-empty-state',
  standalone: true,
  imports: [LYNX_ELEMENTS, UiIcon],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view [class]="containerClass()">
      @if (icon()) {
        <view #iconEl>
          <ui-icon [name]="icon()!" size="lg" class="mb-3" />
        </view>
      }
      <text #titleEl [class]="titleClass()">{{ title() }}</text>
      @if (description()) {
        <text #descEl [class]="descriptionClass()">{{ description() }}</text>
      }
      <ng-content />
    </view>
  `,
})
export class UiEmptyState {
  readonly icon = input<IconName | undefined>(undefined);
  readonly title = input.required<string>();
  readonly description = input('');
  readonly userClass = input<string>('', { alias: 'class' });

  readonly iconElRef = viewChild<ElementRef>('iconEl');
  readonly titleElRef = viewChild<ElementRef>('titleEl');
  readonly descElRef = viewChild<ElementRef>('descEl');

  constructor() {
    // Staggered entrance animation — icon pops, then title fades, then description
    effect(() => {
      const iconEl = this.iconElRef()?.nativeElement;
      const titleEl = this.titleElRef()?.nativeElement;
      const descEl = this.descElRef()?.nativeElement;

      if (iconEl) {
        popIn(iconEl, { duration: 200 });
      }
      if (titleEl) {
        setTimeout(() => fadeIn(titleEl, { duration: DURATION.normal }), 100);
      }
      if (descEl) {
        setTimeout(() => fadeIn(descEl, { duration: DURATION.normal }), 200);
      }
    });
  }

  protected readonly containerClass = computed(() =>
    cn(
      'flex flex-col items-center justify-center py-12 px-6',
      this.userClass(),
    ),
  );

  protected readonly titleClass = computed(() =>
    cn('text-lg font-semibold text-foreground mb-1'),
  );

  protected readonly descriptionClass = computed(() =>
    cn('text-sm text-muted-foreground mb-4 text-center'),
  );
}

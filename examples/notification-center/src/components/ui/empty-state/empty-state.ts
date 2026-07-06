import { Component, ViewEncapsulation, computed, input } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

import { cn } from '@blotch/dolan/utils/cn';
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
        <ui-icon [name]="icon()!" size="lg" class="mb-3" />
      }
      <text [class]="titleClass()">{{ title() }}</text>
      @if (description()) {
        <text [class]="descriptionClass()">{{ description() }}</text>
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

  protected readonly containerClass = computed(() =>
    cn(
      'flex flex-col items-center justify-center px-6 py-12',
      this.userClass(),
    ),
  );

  protected readonly titleClass = computed(() =>
    cn('text-foreground mb-1 text-lg font-semibold'),
  );

  protected readonly descriptionClass = computed(() =>
    cn('text-muted-foreground mb-4 text-center text-sm'),
  );
}

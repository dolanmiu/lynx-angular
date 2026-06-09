import { Component, ViewEncapsulation, computed, input, output } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

import { cn } from '../../utils/cn';

@Component({
  selector: 'ui-scroll-area',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <scroll-view
      [attr.scroll-orientation]="orientation()"
      [attr.bounces]="bounces() || undefined"
      [attr.scroll-bar-enable]="scrollBar() || undefined"
      [attr.enable-nested-scroll]="nestedScroll() || undefined"
      [attr.upper-threshold]="upperThreshold()"
      [attr.lower-threshold]="lowerThreshold()"
      [class]="scrollClass()"
      [style]="scrollStyle()"
      (bindscrolltoupper)="scrolledToStart.emit()"
      (bindscrolltolower)="scrolledToEnd.emit()"
    >
      <view [class]="contentClass()">
        <ng-content />
      </view>
    </scroll-view>
  `,
})
export class UiScrollArea {
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  readonly height = input<string>('');
  readonly bounces = input(true);
  readonly scrollBar = input(true);
  readonly nestedScroll = input(false);
  readonly upperThreshold = input(0);
  readonly lowerThreshold = input(0);
  readonly userClass = input<string>('', { alias: 'class' });
  readonly contentClass_ = input<string>('', { alias: 'contentClass' });

  readonly scrolledToStart = output<void>();
  readonly scrolledToEnd = output<void>();

  protected readonly scrollClass = computed(() =>
    cn('w-full', this.userClass()),
  );

  // Explicit height is required for scroll-view to scroll in Lynx
  protected readonly scrollStyle = computed(() => {
    const h = this.height();
    return h ? `height: ${h};` : '';
  });

  protected readonly contentClass = computed(() =>
    cn(
      this.orientation() === 'vertical' ? 'flex flex-col' : 'flex flex-row',
      this.contentClass_(),
    ),
  );
}

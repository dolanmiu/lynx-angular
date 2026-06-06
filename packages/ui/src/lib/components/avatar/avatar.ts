import { Component, ViewEncapsulation, computed, input } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

import { cn } from '../../utils/cn';

@Component({
  selector: 'ui-avatar',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view [class]="containerClass()">
      @if (src()) {
        <image [attr.src]="src()" [class]="imageClass()" />
      } @else {
        <view [class]="fallbackClass()">
          <text [class]="initialsClass()">{{ fallback() }}</text>
        </view>
      }
    </view>
  `,
})
export class UiAvatar {
  readonly src = input<string>('');
  readonly fallback = input<string>('');
  readonly size = input<'default' | 'sm' | 'lg'>('default');
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly containerClass = computed(() =>
    cn(
      'flex items-center justify-center overflow-hidden rounded-full',
      {
        'h-10 w-10': this.size() === 'default',
        'h-8 w-8': this.size() === 'sm',
        'h-14 w-14': this.size() === 'lg',
      },
      this.userClass(),
    ),
  );

  protected readonly imageClass = computed(() =>
    cn('h-full w-full', {
      'h-10 w-10': this.size() === 'default',
      'h-8 w-8': this.size() === 'sm',
      'h-14 w-14': this.size() === 'lg',
    }),
  );

  protected readonly fallbackClass = computed(() =>
    cn('flex h-full w-full items-center justify-center rounded-full bg-muted'),
  );

  protected readonly initialsClass = computed(() =>
    cn('font-medium text-muted-foreground', {
      'text-sm': this.size() === 'default' || this.size() === 'sm',
      'text-lg': this.size() === 'lg',
    }),
  );
}

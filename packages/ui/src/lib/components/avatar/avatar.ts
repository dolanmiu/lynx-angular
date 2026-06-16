import type { ElementRef } from '@angular/core';
import {
  Component,
  ViewEncapsulation,
  computed,
  input,
  viewChild,
} from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

import { fadeIn } from '../../utils/animate';
import { cn } from '../../utils/cn';

@Component({
  selector: 'ui-avatar',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view [class]="containerClass()">
      @if (src()) {
        <image
          #img
          [attr.src]="src()"
          [class]="imageClass()"
          (bindload)="onImageLoad()"
          style="opacity: 0;"
        />
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
  readonly size = input<'default' | 'sm' | 'lg' | 'xl' | '2xl'>('default');
  readonly userClass = input<string>('', { alias: 'class' });

  readonly imgRef = viewChild<ElementRef>('img');

  /** Fade the image in once it has loaded */
  protected onImageLoad(): void {
    const el = this.imgRef()?.nativeElement;
    if (el) {
      fadeIn(el, { duration: 200 });
    }
  }

  protected readonly containerClass = computed(() =>
    cn(
      'flex items-center justify-center overflow-hidden rounded-full',
      {
        'h-10 w-10': this.size() === 'default',
        'h-8 w-8': this.size() === 'sm',
        'h-14 w-14': this.size() === 'lg',
        'h-20 w-20': this.size() === 'xl',
        'h-28 w-28': this.size() === '2xl',
      },
      this.userClass(),
    ),
  );

  protected readonly imageClass = computed(() =>
    cn('h-full w-full', {
      'h-10 w-10': this.size() === 'default',
      'h-8 w-8': this.size() === 'sm',
      'h-14 w-14': this.size() === 'lg',
      'h-20 w-20': this.size() === 'xl',
      'h-28 w-28': this.size() === '2xl',
    }),
  );

  protected readonly fallbackClass = computed(() =>
    cn('flex h-full w-full items-center justify-center rounded-full bg-muted'),
  );

  protected readonly initialsClass = computed(() =>
    cn('font-medium text-muted-foreground', {
      'text-sm': this.size() === 'default' || this.size() === 'sm',
      'text-lg': this.size() === 'lg',
      'text-2xl': this.size() === 'xl',
      'text-3xl': this.size() === '2xl',
    }),
  );
}

import { Component, ViewEncapsulation, computed, input } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

import { cn } from '../../utils/cn';

@Component({
  selector: 'ui-skeleton',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `<view [class]="skeletonClass()" />`,
  styles: `
    @keyframes pulse {
      0%,
      100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
  `,
})
export class UiSkeleton {
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly skeletonClass = computed(() =>
    cn('rounded-md bg-muted', this.userClass()),
  );
}

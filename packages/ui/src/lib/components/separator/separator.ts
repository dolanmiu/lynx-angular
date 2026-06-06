import { Component, ViewEncapsulation, computed, input } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

import { cn } from '../../utils/cn';

@Component({
  selector: 'ui-separator',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `<view [class]="separatorClass()" />`,
})
export class UiSeparator {
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly separatorClass = computed(() =>
    cn(
      'bg-border',
      this.orientation() === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
      this.userClass(),
    ),
  );
}

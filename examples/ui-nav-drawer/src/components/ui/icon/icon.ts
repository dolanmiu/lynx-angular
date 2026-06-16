import { Component, ViewEncapsulation, computed, input } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

import { type IconName, ICONS } from './icons';

const SIZE_MAP = { xs: 16, sm: 20, md: 24, lg: 32 } as const;

@Component({
  selector: 'ui-icon',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: ` <svg [attr.content]="svgContent()" [style]="sizeStyle()" /> `,
})
export class UiIcon {
  readonly name = input.required<IconName>();
  readonly size = input<'xs' | 'sm' | 'md' | 'lg'>('md');
  readonly color = input<string | undefined>(undefined);

  protected readonly svgContent = computed(() => {
    let svg = ICONS[this.name()];
    const c = this.color();
    if (c) {
      svg = svg.replaceAll('currentColor', c);
    }
    return svg;
  });

  protected readonly sizeStyle = computed(() => {
    const px = SIZE_MAP[this.size()];
    return `width: ${px}px; height: ${px}px;`;
  });
}

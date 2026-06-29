import { Component, ViewEncapsulation, input } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

import { type IconName, ICONS } from './icons';

const SIZE_MAP = { xs: 16, sm: 20, md: 24, lg: 32 } as const;

/**
 * SVG markup is passed via [attr.content] rather than as child elements.
 * Lynx's native <svg> element can't contain child nodes in the flat element
 * model. Passing the full SVG string as the `content` attribute is how Lynx
 * renders vector graphics without a DOM tree.
 */
@Component({
  selector: 'ui-icon',
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <svg [attr.content]="svgContent()" [attr.style]="sizeStyle()" />
  `,
})
export class UiIcon {
  readonly name = input.required<IconName>();
  readonly size = input<'xs' | 'sm' | 'md' | 'lg'>('md');
  readonly color = input<string | undefined>(undefined);

  /**
   * Plain methods rather than computed() signals. Using computed() can cause a
   * "not a function" crash in Rspack's dev bundle when the reactive module is
   * split across import slots, leaving the computed node's prototype without
   * consumerOnSignalRead. Plain methods are read under the lView consumer
   * context which is always correct, so this avoids the crash entirely.
   */
  protected svgContent(): string {
    let svg = ICONS[this.name()];
    const c = this.color();
    if (c) {
      // Lynx SVG elements don't propagate the CSS `color` property into
      // SVG stroke attributes, so we substitute directly in the markup string
      // rather than relying on `currentColor` CSS propagation.
      svg = svg.replaceAll('currentColor', c);
    }
    return svg;
  }

  protected sizeStyle(): string {
    const px = SIZE_MAP[this.size()];
    return `width: ${px}px; height: ${px}px;`;
  }
}

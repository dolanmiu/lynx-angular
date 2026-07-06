import { Component, ViewEncapsulation, computed, input } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

export const typographyVariants = cva('', {
  variants: {
    variant: {
      h1: 'text-foreground text-4xl font-bold',
      h2: 'text-foreground text-3xl font-semibold',
      h3: 'text-foreground text-2xl font-semibold',
      h4: 'text-foreground text-xl font-semibold',
      p: 'text-foreground text-base',
      lead: 'text-muted-foreground text-xl',
      large: 'text-foreground text-lg font-semibold',
      small: 'text-foreground text-sm font-medium',
      muted: 'text-muted-foreground text-sm',
    },
  },
  defaultVariants: {
    variant: 'p',
  },
});

export type TypographyVariant = NonNullable<
  VariantProps<typeof typographyVariants>['variant']
>;

@Component({
  selector: 'ui-text',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `<text [class]="textClass()"><ng-content /></text>`,
})
export class UiText {
  readonly variant = input<TypographyVariant>('p');
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly textClass = computed(() =>
    cn(typographyVariants({ variant: this.variant() }), this.userClass()),
  );
}

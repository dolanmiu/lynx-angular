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
import { cva, type VariantProps } from 'class-variance-authority';

import { popIn } from '../../utils/animate';
import { cn } from '../../utils/cn';

export const badgeVariants = cva(
  'flex items-center rounded-full px-2.5 py-0.5',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        secondary: 'bg-secondary',
        destructive: 'bg-destructive',
        outline: 'border border-border bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const badgeTextVariants = cva('text-xs font-semibold', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      secondary: 'text-secondary-foreground',
      destructive: 'text-destructive-foreground',
      outline: 'text-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export type BadgeVariant = NonNullable<
  VariantProps<typeof badgeVariants>['variant']
>;

@Component({
  selector: 'ui-badge',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view #container [class]="containerClass()">
      <text [class]="labelClass()"><ng-content /></text>
    </view>
  `,
})
export class UiBadge {
  readonly variant = input<BadgeVariant>('default');
  /** When true, badge pops in with a spring animation on first render */
  readonly animated = input(true);
  readonly userClass = input<string>('', { alias: 'class' });

  readonly containerRef = viewChild<ElementRef>('container');

  constructor() {
    effect(() => {
      const el = this.containerRef()?.nativeElement;
      if (el && this.animated()) {
        popIn(el, { duration: 200 });
      }
    });
  }

  protected readonly containerClass = computed(() =>
    cn(badgeVariants({ variant: this.variant() }), this.userClass()),
  );

  protected readonly labelClass = computed(() =>
    cn(badgeTextVariants({ variant: this.variant() })),
  );
}

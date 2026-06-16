import type { ElementRef } from '@angular/core';
import { Component, ViewEncapsulation, computed, effect, input, viewChild } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { cva, type VariantProps } from 'class-variance-authority';

import { revealIn } from '@blotch/dolan/utils/animate';
import { cn } from '@blotch/dolan/utils/cn';

export const alertVariants = cva('flex flex-col rounded-lg border p-4', {
  variants: {
    variant: {
      default: 'bg-background border-border',
      destructive: 'border-destructive/50 bg-destructive/10',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const alertTitleVariants = cva('mb-1 font-medium', {
  variants: {
    variant: {
      default: 'text-foreground',
      destructive: 'text-destructive',
    },
  },
  defaultVariants: { variant: 'default' },
});

const alertDescriptionVariants = cva('text-sm', {
  variants: {
    variant: {
      default: 'text-muted-foreground',
      destructive: 'text-destructive',
    },
  },
  defaultVariants: { variant: 'default' },
});

export type AlertVariant = NonNullable<
  VariantProps<typeof alertVariants>['variant']
>;

@Component({
  selector: 'ui-alert',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view #container [class]="containerClass()">
      @if (title()) {
        <text [class]="titleClass()">{{ title() }}</text>
      }
      @if (description()) {
        <text [class]="descriptionClass()">{{ description() }}</text>
      }
      <ng-content />
    </view>
  `,
})
export class UiAlert {
  readonly variant = input<AlertVariant>('default');
  readonly title = input<string>('');
  readonly description = input<string>('');
  readonly userClass = input<string>('', { alias: 'class' });

  readonly containerRef = viewChild<ElementRef>('container');

  constructor() {
    // Subtle entrance animation on first render
    effect(() => {
      const el = this.containerRef()?.nativeElement;
      if (el) {
        revealIn(el, { fromY: 4 });
      }
    });
  }

  protected readonly containerClass = computed(() =>
    cn(alertVariants({ variant: this.variant() }), this.userClass()),
  );

  protected readonly titleClass = computed(() =>
    cn(alertTitleVariants({ variant: this.variant() })),
  );

  protected readonly descriptionClass = computed(() =>
    cn(alertDescriptionVariants({ variant: this.variant() })),
  );
}

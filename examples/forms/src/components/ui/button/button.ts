import { type ElementRef, Component, ViewEncapsulation, computed, input, output, viewChild } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { cva, type VariantProps } from 'class-variance-authority';

import {
  type AnimationHandle,
  pressDown,
  pressRelease,
} from '@blotch/dolan/utils/animate';
import { cn } from '@blotch/dolan/utils/cn';
import { UiSpinner } from '../spinner/spinner';

export const buttonVariants = cva(
  'flex items-center justify-center rounded-md',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        destructive: 'bg-destructive',
        outline: 'border border-border bg-background',
        secondary: 'bg-secondary',
        ghost: 'bg-transparent',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const buttonTextVariants = cva('font-medium', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      destructive: 'text-destructive-foreground',
      outline: 'text-foreground',
      secondary: 'text-secondary-foreground',
      ghost: 'text-foreground',
    },
    size: {
      default: 'text-sm',
      sm: 'text-xs',
      lg: 'text-base',
      icon: 'text-sm',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

export type ButtonVariant = NonNullable<
  VariantProps<typeof buttonVariants>['variant']
>;
export type ButtonSize = NonNullable<
  VariantProps<typeof buttonVariants>['size']
>;

@Component({
  selector: 'ui-button',
  imports: [LYNX_ELEMENTS, UiSpinner],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view
      #container
      [class]="containerClass()"
      (bindtouchstart)="onPressStart()"
      (bindtouchend)="onPressEnd()"
      (bindtouchcancel)="onPressCancel()"
      (bindtap)="onTap()"
    >
      @if (loading()) {
        <ui-spinner [size]="spinnerSize()" />
      } @else {
        <text [class]="labelClass()"><ng-content /></text>
      }
    </view>
  `,
})
export class UiButton {
  readonly variant = input<ButtonVariant>('default');
  readonly size = input<ButtonSize>('default');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly userClass = input<string>('', { alias: 'class' });

  readonly pressed = output<void>();

  readonly containerRef = viewChild<ElementRef>('container');
  #pressAnim?: AnimationHandle;

  protected readonly containerClass = computed(() =>
    cn(
      buttonVariants({ variant: this.variant(), size: this.size() }),
      (this.disabled() || this.loading()) && 'opacity-50',
      this.userClass(),
    ),
  );

  protected readonly labelClass = computed(() =>
    cn(buttonTextVariants({ variant: this.variant(), size: this.size() })),
  );

  protected readonly spinnerSize = computed(() => {
    const s = this.size();
    return s === 'sm' ? ('xs' as const) : ('sm' as const);
  });

  protected onPressStart(): void {
    if (this.disabled() || this.loading()) return;
    this.#pressAnim?.cancel();
    this.#pressAnim = pressDown(this.containerRef()?.nativeElement);
  }

  protected onPressEnd(): void {
    if (this.disabled() || this.loading()) return;
    this.#pressAnim?.cancel();
    this.#pressAnim = pressRelease(this.containerRef()?.nativeElement);
  }

  protected onPressCancel(): void {
    this.#pressAnim?.cancel();
    this.#pressAnim = pressRelease(this.containerRef()?.nativeElement);
  }

  protected onTap(): void {
    if (!this.disabled() && !this.loading()) {
      this.pressed.emit();
    }
  }
}

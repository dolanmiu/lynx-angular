import {
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
  model,
} from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

const toggleVariants = cva(
  'flex items-center justify-center rounded-md active:opacity-80',
  {
    variants: {
      variant: {
        default: '',
        outline: 'border border-border',
      },
      size: {
        default: 'h-10 px-3',
        sm: 'h-9 px-2.5',
        lg: 'h-11 px-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export type ToggleVariant = NonNullable<
  VariantProps<typeof toggleVariants>['variant']
>;
export type ToggleSize = NonNullable<
  VariantProps<typeof toggleVariants>['size']
>;

@Component({
  selector: 'ui-toggle',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view [class]="containerClass()" (bindtap)="onTap()">
      <ng-content />
    </view>
  `,
})
export class UiToggle {
  readonly pressed = model(false);
  readonly variant = input<ToggleVariant>('default');
  readonly size = input<ToggleSize>('default');
  readonly disabled = input(false);
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly containerClass = computed(() =>
    cn(
      toggleVariants({ variant: this.variant(), size: this.size() }),
      this.pressed() ? 'bg-accent' : 'bg-transparent',
      this.disabled() && 'opacity-50 active:opacity-50',
      this.userClass(),
    ),
  );

  protected onTap(): void {
    if (this.disabled()) return;
    this.pressed.update((v) => !v);
  }
}

@Component({
  selector: 'ui-toggle-group',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view [class]="containerClass()">
      <ng-content />
    </view>
  `,
})
export class UiToggleGroup {
  readonly type = input<'single' | 'multiple'>('single');
  readonly value = model<string[]>([]);
  readonly variant = input<ToggleVariant>('default');
  readonly size = input<ToggleSize>('default');
  readonly disabled = input(false);
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly containerClass = computed(() =>
    cn('flex flex-row items-center gap-1', this.userClass()),
  );

  toggle(val: string): void {
    if (this.disabled()) return;
    if (this.type() === 'single') {
      const current = this.value();
      this.value.set(current.includes(val) ? [] : [val]);
    } else {
      this.value.update((list) =>
        list.includes(val) ? list.filter((v) => v !== val) : [...list, val],
      );
    }
  }

  isSelected(val: string): boolean {
    return this.value().includes(val);
  }
}

@Component({
  selector: 'ui-toggle-group-item',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view [class]="containerClass()" (bindtap)="onTap()">
      <ng-content />
    </view>
  `,
})
export class UiToggleGroupItem {
  readonly #group = inject(UiToggleGroup);

  readonly itemValue = input.required<string>({ alias: 'value' });
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly isSelected = computed(() =>
    this.#group.isSelected(this.itemValue()),
  );

  protected readonly containerClass = computed(() =>
    cn(
      toggleVariants({
        variant: this.#group.variant(),
        size: this.#group.size(),
      }),
      this.isSelected() ? 'bg-accent' : 'bg-transparent',
      this.#group.disabled() && 'opacity-50 active:opacity-50',
      this.userClass(),
    ),
  );

  protected onTap(): void {
    this.#group.toggle(this.itemValue());
  }
}

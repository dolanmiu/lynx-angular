import {
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

import { cn } from '../../utils/cn';

@Component({
  selector: 'ui-radio-group',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view [class]="containerClass()">
      <ng-content />
    </view>
  `,
})
export class UiRadioGroup {
  readonly value = model<string>('');
  readonly disabled = input(false);
  readonly userClass = input<string>('', { alias: 'class' });

  readonly changed = output<string>();

  protected readonly containerClass = computed(() =>
    cn('flex flex-col gap-2', this.userClass()),
  );

  select(value: string): void {
    if (this.disabled()) return;
    this.value.set(value);
    this.changed.emit(value);
  }
}

@Component({
  selector: 'ui-radio-group-item',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view [class]="itemClass()" (bindtap)="select()">
      <view [class]="circleClass()">
        @if (isSelected()) {
          <view [class]="dotClass()" />
        }
      </view>
      <text [class]="labelClass()"><ng-content /></text>
    </view>
  `,
})
export class UiRadioGroupItem {
  readonly #group = inject(UiRadioGroup);

  readonly itemValue = input.required<string>({ alias: 'value' });
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly isSelected = computed(
    () => this.#group.value() === this.itemValue(),
  );

  protected readonly itemClass = computed(() =>
    cn(
      'flex flex-row items-center gap-3 active:opacity-80',
      this.#group.disabled() && 'opacity-50 active:opacity-50',
      this.userClass(),
    ),
  );

  protected readonly circleClass = computed(() =>
    cn(
      'flex items-center justify-center h-4 w-4 rounded-full border',
      this.isSelected() ? 'border-primary' : 'border-primary',
    ),
  );

  protected readonly dotClass = computed(() =>
    cn('h-2.5 w-2.5 rounded-full bg-primary'),
  );

  protected readonly labelClass = computed(() => cn('text-sm text-foreground'));

  select(): void {
    if (this.#group.disabled()) return;
    this.#group.select(this.itemValue());
  }
}

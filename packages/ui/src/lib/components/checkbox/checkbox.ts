import {
  Component,
  ViewEncapsulation,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

import { cn } from '../../utils/cn';

@Component({
  selector: 'ui-checkbox',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view [class]="boxClass()" (bindtap)="toggle()">
      @if (checked()) {
        <text [class]="checkClass()">✓</text>
      }
    </view>
  `,
})
export class UiCheckbox {
  readonly checked = model(false);
  readonly disabled = input(false);
  readonly userClass = input<string>('', { alias: 'class' });

  readonly changed = output<boolean>();

  protected readonly boxClass = computed(() =>
    cn(
      'flex items-center justify-center h-4 w-4 rounded-sm border active:opacity-80',
      this.checked()
        ? 'bg-primary border-primary'
        : 'border-primary bg-transparent',
      this.disabled() && 'opacity-50 active:opacity-50',
      this.userClass(),
    ),
  );

  protected readonly checkClass = computed(() =>
    cn('text-[10px] font-bold text-primary-foreground'),
  );

  toggle(): void {
    if (this.disabled()) return;
    const next = !this.checked();
    this.checked.set(next);
    this.changed.emit(next);
  }
}

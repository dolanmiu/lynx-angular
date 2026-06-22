import type { ElementRef } from '@angular/core';
import {
  Component,
  ViewEncapsulation,
  computed,
  effect,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

import { type AnimationHandle, shake } from '../../utils/animate';
import { cn } from '../../utils/cn';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view #container [class]="containerClass()">
      @if (label()) {
        <text [class]="labelClass()">{{ label() }}</text>
      }
      <!-- [attr.disabled]="disabled() || undefined": passing 'undefined'
           removes the attribute entirely; passing 'false' would set
           disabled="false" which Lynx still treats as disabled. -->
      <input
        [attr.placeholder]="placeholder()"
        [attr.type]="type()"
        [attr.value]="value()"
        [attr.disabled]="disabled() || undefined"
        [class]="inputClass()"
        (bindinput)="onInput($any($event))"
        (bindfocus)="onFocus()"
        (bindblur)="onBlur()"
      />
      @if (error()) {
        <text [class]="errorClass()">{{ error() }}</text>
      } @else if (helperText()) {
        <text [class]="helperClass()">{{ helperText() }}</text>
      }
    </view>
  `,
})
export class UiInput {
  readonly value = model<string>('');
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly type = input<string>('text');
  readonly helperText = input<string>('');
  readonly error = input<string>('');
  readonly disabled = input(false);
  readonly userClass = input<string>('', { alias: 'class' });

  readonly changed = output<string>();
  readonly focused = output<void>();
  readonly blurred = output<void>();

  readonly containerRef = viewChild<ElementRef>('container');
  readonly #isFocused = signal(false);
  #shakeAnim?: AnimationHandle;
  #previousError = '';

  constructor() {
    // Shake the input when an error appears (transition from no-error to error)
    effect(() => {
      const err = this.error();
      const el = this.containerRef()?.nativeElement;
      if (err && !this.#previousError && el) {
        this.#shakeAnim?.cancel();
        this.#shakeAnim = shake(el);
      }
      this.#previousError = err;
    });
  }

  protected readonly containerClass = computed(() =>
    cn('flex flex-col gap-1.5', this.userClass()),
  );

  protected readonly labelClass = computed(() =>
    cn('text-sm font-medium text-foreground'),
  );

  protected readonly inputClass = computed(() =>
    cn(
      'h-10 w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground',
      this.error()
        ? 'border-destructive'
        : this.#isFocused()
          ? 'border-ring border-2'
          : 'border-input',
      this.disabled() && 'opacity-50',
    ),
  );

  protected readonly helperClass = computed(() =>
    cn('text-xs text-muted-foreground'),
  );

  protected readonly errorClass = computed(() =>
    cn('text-xs text-destructive'),
  );

  protected onFocus(): void {
    this.#isFocused.set(true);
    this.focused.emit();
  }

  protected onBlur(): void {
    this.#isFocused.set(false);
    this.blurred.emit();
  }

  /**
   * Lynx input events carry the updated value in `event.detail.value`,
   * not in `event.target.value` as on the web — hence the custom type.
   */
  protected onInput(event: { detail: { value: string } }): void {
    if (this.disabled()) return;
    this.value.set(event.detail.value);
    this.changed.emit(event.detail.value);
  }
}

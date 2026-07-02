import { type ElementRef, Component, ViewEncapsulation, computed, effect, input, model, output, signal, viewChild } from '@angular/core';
import { type FormValueControl } from '@angular/forms/signals';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

import { type AnimationHandle, shake } from '@blotch/dolan/utils/animate';
import { cn } from '@blotch/dolan/utils/cn';

@Component({
  selector: 'ui-textarea',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view #container [class]="containerClass()">
      @if (label()) {
        <text [class]="labelClass()">{{ label() }}</text>
      }
      <view [class]="textareaWrapperClass()">
        <!-- [attr.disabled]="disabled() || undefined": passing 'undefined'
             removes the attribute entirely; passing 'false' would set
             disabled="false" which Lynx still treats as disabled. -->
        <textarea
          [attr.placeholder]="placeholder()"
          [attr.value]="value()"
          [attr.disabled]="disabled() || undefined"
          class="text-sm text-foreground"
          style="border: none; background: transparent; height: 100%; width: 100%;"
          (bindinput)="onInput($any($event))"
          (bindfocus)="onFocus()"
          (bindblur)="onBlur()"
        ></textarea>
      </view>
      @if (error()) {
        <text [class]="errorClass()">{{ error() }}</text>
      } @else if (helperText()) {
        <text [class]="helperClass()">{{ helperText() }}</text>
      }
    </view>
  `,
})
export class UiTextarea implements FormValueControl<string> {
  readonly value = model<string>('');
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
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
    // Shake when an error first appears
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

  protected readonly textareaWrapperClass = computed(() =>
    cn(
      'min-h-20 rounded-xl bg-muted px-3.5 py-2.5',
      this.error()
        ? 'ring-2 ring-destructive'
        : this.#isFocused()
          ? 'ring-2 ring-ring'
          : '',
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

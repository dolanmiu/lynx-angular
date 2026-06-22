import {
  Directive,
  ElementRef,
  HostListener,
  Renderer2,
  forwardRef,
  inject,
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * ControlValueAccessor for <input> elements. Bridges Angular's form model
 * (reactive forms, template-driven NgModel, Signal Forms [formField]) to Lynx's
 * native events (bindinput, bindblur) instead of the standard DOM input/change events.
 *
 * Activated only when a form directive is present (formControl, formControlName,
 * ngModel, or formField) — bare <input> elements continue to use LynxInput alone.
 */
@Directive({
  selector:
    'input[formControlName],input[formControl],input[ngModel],input[formField]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LynxInputValueAccessor),
      multi: true,
    },
  ],
})
export class LynxInputValueAccessor implements ControlValueAccessor {
  readonly #renderer = inject(Renderer2);
  readonly #el = inject(ElementRef);
  #onChange: (value: string) => void = () => {};
  #onTouched: () => void = () => {};

  /**
   * @HostListener ultimately calls renderer.listen(), which is the correct Lynx
   * event path. Using @Output() would break delivery (template compiler intercepts it).
   */
  @HostListener('bindinput', ['$event'])
  onInput(event: Event): void {
    // Lynx bindinput carries the typed value in event.detail.value, not event.target.value.
    this.#onChange(
      (event as CustomEvent<{ value: string }>).detail?.value ?? '',
    );
  }

  @HostListener('bindblur')
  onBlur(): void {
    this.#onTouched();
  }

  writeValue(value: string): void {
    // setAttribute routes through BaseLynxElement.setAttribute → __SetAttribute,
    // same path as LynxInput.ngOnChanges for the [value] binding.
    this.#renderer.setAttribute(this.#el.nativeElement, 'value', value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.#onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.#onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.#renderer.setAttribute(this.#el.nativeElement, 'disabled', 'true');
    } else {
      this.#renderer.removeAttribute(this.#el.nativeElement, 'disabled');
    }
  }
}

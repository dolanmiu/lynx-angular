import {
  type ElementRef,
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
      <!-- The min/max height lives on this wrapper, not the textarea: a native
           Lynx textarea only auto-grows when it drives its container's height
           (via height:100% below). Pinning min/max-height on the textarea itself
           locks it to a fixed box that scrolls but never grows. -->
      <view [class]="textareaWrapperClass()" [style]="wrapperStyle()">
        <!-- [attr.disabled]="disabled() || undefined": passing 'undefined'
             removes the attribute entirely; passing 'false' would set
             disabled="false" which Lynx still treats as disabled. -->
        <!-- [value] not [attr.value]: same reason as UiInput — routes through
             LynxTextarea.ngOnChanges so value changes call invoke("setValue")
             rather than the ineffective __SetAttribute path. -->
        <!-- [attr.enable-scroll-bar]: only surface the scrollbar once maxLines is
             set (i.e. the field can actually scroll). Native scrolling past
             max-height works regardless; this just shows the indicator.
             height:100% makes the textarea fill (and grow) the wrapper; the
             pinned line-height keeps the wrapper's line math exact. -->
        <!-- [attr.placeholder]: suppress the placeholder whenever a value is
             present. The browser hides a placeholder under a value automatically,
             but Lynx's iOS textarea renders the placeholder as a separate overlay
             view that only hides on textViewDidChange — so an initial value set via
             the setValue UIMethod leaves the placeholder stacked on top of it. Not
             emitting the attribute when there's a value matches web semantics and
             avoids the overlap on all platforms. -->
        <textarea
          [attr.placeholder]="value() ? null : placeholder()"
          [value]="value()"
          [attr.disabled]="disabled() || undefined"
          [attr.enable-scroll-bar]="maxLines() != null ? 'true' : null"
          class="text-sm text-foreground"
          style="border: none; background: transparent; height: 100%; width: 100%; line-height: 20px;"
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

  // SwiftUI-style lineLimit(min...max). The field opens at minLines, grows with
  // content, then stops at maxLines and scrolls internally. maxLines defaults to
  // undefined so the field grows unbounded (the previous behavior) unless capped.
  readonly minLines = input(3);
  readonly maxLines = input<number>();

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
    cn('flex-col gap-1.5 flex', this.userClass()),
  );

  protected readonly labelClass = computed(() =>
    cn('text-sm font-medium text-foreground'),
  );

  protected readonly textareaWrapperClass = computed(() =>
    cn(
      // No min-height here — the minimum is now enforced by the textarea's own
      // min-height (minLines) so callers can go below the old 3-line floor.
      'rounded-xl bg-muted px-3.5 py-2.5',
      this.disabled() && 'opacity-50',
    ),
  );

  /**
   * Focus ring as an inline box-shadow. Tailwind's ring-* utilities render
   * nothing on Lynx — the preset doesn't wire up the --tw-ring-* variables they
   * compose into box-shadow — so the ring has to be an inline box-shadow, the
   * one shadow form Lynx honors (incl. iOS). A 2px spread with no offset/blur is
   * exactly a ring, and it inherits the wrapper's rounded-xl corners.
   * var(--ring)/var(--destructive) resolve at runtime and track dark mode. This
   * is folded into wrapperStyle() rather than bound via [style.box-shadow]
   * because the wrapper already has a whole-string [style]: mixing whole-string
   * (__SetInlineStyles) and per-key (__AddInlineStyle) inline styles on one
   * element lets the whole-string set clobber the per-key one. Returns '' when
   * unfocused/error-free so it drops out of the joined string (and, since
   * __SetInlineStyles replaces rather than merges, the ring clears on blur).
   * Error takes precedence over focus so an invalid field always shows red.
   */
  protected readonly focusRing = computed(() => {
    if (this.error()) return 'box-shadow: 0 0 0 2px var(--destructive)';
    if (this.#isFocused()) return 'box-shadow: 0 0 0 2px var(--ring)';
    return '';
  });

  // Sizing lives on the wrapper so the textarea (height:100%) grows it with
  // content between min and max, then scrolls at the cap — the native textarea
  // does not auto-grow on its own. The textarea's pinned line-height (20px, the
  // text-sm line box) makes N lines map to exactly N*20px, independent of
  // platform font metrics or Tailwind default drift. Lynx views are border-box,
  // so these heights include the wrapper's py-2.5 (20px) vertical padding.
  // maxLines is omitted when unset so the field keeps growing unbounded (the
  // previous default).
  protected readonly wrapperStyle = computed(() => {
    const lineHeight = 20;
    const verticalPadding = 20; // py-2.5 → 10px top + 10px bottom
    const max = this.maxLines();
    return [
      `min-height: ${this.minLines() * lineHeight + verticalPadding}px`,
      max != null ? `max-height: ${max * lineHeight + verticalPadding}px` : '',
      this.focusRing(),
    ]
      .filter(Boolean)
      .join('; ');
  });

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

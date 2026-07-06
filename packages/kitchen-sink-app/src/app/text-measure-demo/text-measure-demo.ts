import { Component, inject, signal } from '@angular/core';
import { LYNX_ELEMENTS, LynxTextMeasure } from '@blotch/angular-lynx';
import type { TextMetrics } from '@lynx-js/types';

@Component({
  selector: 'app-text-measure-demo',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  template: `
    <view class="p-4">
      <text class="mb-4 text-[22px] font-bold">Text Measurement Demo</text>

      <text class="mb-1 mt-3 text-[13px] text-gray-500"
        >Enter text to measure:</text
      >
      <input
        placeholder="Type something..."
        type="text"
        (bindinput)="onInput($any($event))"
      />

      <view class="mt-4">
        <text class="mb-1 mt-3 text-[13px] text-gray-500"
          >Measured at 14px:</text
        >
        <text class="mb-1 text-base">Width: {{ small().width }}px</text>

        <text class="mb-1 mt-3 text-[13px] text-gray-500"
          >Measured at 24px:</text
        >
        <text class="mb-1 text-base">Width: {{ large().width }}px</text>

        <text class="mb-1 mt-3 text-[13px] text-gray-500"
          >Line-break (maxWidth: 150px, maxLine: 3):</text
        >
        <text class="mb-1 text-base">Width: {{ wrapped().width }}px</text>
        @for (line of wrapped().content ?? []; track $index) {
          <text class="mb-0.5 font-[monospace] text-sm text-gray-800"
            >Line {{ $index + 1 }}: "{{ line }}"</text
          >
        }
      </view>
    </view>
  `,
})
export class TextMeasureDemo {
  readonly #textMeasure = inject(LynxTextMeasure);

  readonly small = signal<TextMetrics>({ width: 0 });
  readonly large = signal<TextMetrics>({ width: 0 });
  readonly wrapped = signal<TextMetrics>({ width: 0 });

  /**
   * Lynx input events deliver the updated value in `event.detail.value`,
   * not `event.target.value` as in the browser DOM — hence the custom type.
   */
  onInput(event: { detail: { value: string } }): void {
    const text = event.detail.value;
    if (!text) {
      this.small.set({ width: 0 });
      this.large.set({ width: 0 });
      this.wrapped.set({ width: 0 });
      return;
    }

    this.small.set(this.#textMeasure.measure(text, { fontSize: '14px' }));
    this.large.set(this.#textMeasure.measure(text, { fontSize: '24px' }));
    this.wrapped.set(
      this.#textMeasure.measure(text, {
        fontSize: '14px',
        maxWidth: '150px',
        maxLine: 3,
      }),
    );
  }
}

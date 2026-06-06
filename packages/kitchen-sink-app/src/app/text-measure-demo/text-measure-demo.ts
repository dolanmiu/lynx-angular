import { Component, inject, signal } from '@angular/core';
import { LYNX_ELEMENTS, LynxTextMeasure } from '@blotch/angular-lynx';
import type { TextMetrics } from '@lynx-js/types';

@Component({
  selector: 'app-text-measure-demo',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  template: `
    <view class="container">
      <text class="page-title">Text Measurement Demo</text>

      <text class="section-label">Enter text to measure:</text>
      <input
        placeholder="Type something..."
        type="text"
        (bindinput)="onInput($any($event))"
      />

      <view class="results">
        <text class="section-label">Measured at 14px:</text>
        <text class="result">Width: {{ small().width }}px</text>

        <text class="section-label">Measured at 24px:</text>
        <text class="result">Width: {{ large().width }}px</text>

        <text class="section-label"
          >Line-break (maxWidth: 150px, maxLine: 3):</text
        >
        <text class="result">Width: {{ wrapped().width }}px</text>
        @for (line of wrapped().content ?? []; track $index) {
          <text class="line">Line {{ $index + 1 }}: "{{ line }}"</text>
        }
      </view>
    </view>
  `,
  styles: [
    `
      .container {
        padding: 16px;
      }

      .page-title {
        font-size: 22px;
        font-weight: bold;
        margin-bottom: 16px;
      }

      .section-label {
        font-size: 13px;
        color: #666;
        margin-top: 12px;
        margin-bottom: 4px;
      }

      .results {
        margin-top: 16px;
      }

      .result {
        font-size: 16px;
        margin-bottom: 4px;
      }

      .line {
        font-size: 14px;
        color: #333;
        font-family: monospace;
        margin-bottom: 2px;
      }
    `,
  ],
})
export class TextMeasureDemo {
  readonly #textMeasure = inject(LynxTextMeasure);

  readonly small = signal<TextMetrics>({ width: 0 });
  readonly large = signal<TextMetrics>({ width: 0 });
  readonly wrapped = signal<TextMetrics>({ width: 0 });

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

import { Component, computed, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="page" scroll-orientation="vertical">
      <view class="container">
        <text class="title">Textarea Element</text>
        <text class="subtitle">
          Multi-line input with a reactive character counter.
        </text>

        <view class="card">
          <text class="section-label">Compose</text>
          <textarea
            class="textarea"
            placeholder="Write a message..."
            (bindinput)="onInput($event)"
          ></textarea>
          <text class="char-count">{{ charCount() }} characters</text>
        </view>
      </view>
    </scroll-view>
  `,
  styles: `
    .page { height: 100%; background-color: #fafafa; }
    .container { padding: 24px; }
    .title { font-size: 28px; font-weight: bold; color: #18181b; margin-bottom: 4px; }
    .subtitle { font-size: 13px; color: #71717a; margin-bottom: 20px; }
    .card { background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 16px; }
    .section-label { font-size: 11px; font-weight: 700; color: #a1a1aa; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    .textarea { padding: 12px 14px; font-size: 15px; border: 1px solid #e4e4e7; border-radius: 8px; height: 120px; background-color: #ffffff; }
    .char-count { font-size: 12px; color: #a1a1aa; text-align: right; margin-top: 6px; }
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  readonly text = signal('');
  readonly charCount = computed(() => this.text().length);

  onInput(event: { detail: { value: string } }): void {
    this.text.set(event.detail.value);
  }
}

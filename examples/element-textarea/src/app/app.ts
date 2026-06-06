import { Component, computed, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <view style="padding: 24px;">
      <text style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">
        Textarea Element
      </text>

      <textarea
        placeholder="Write a message..."
        style="border: 1px solid #ccc; padding: 12px; border-radius: 8px; font-size: 16px; height: 120px; margin-bottom: 8px;"
        (bindinput)="onInput($event)"
      ></textarea>

      <text style="font-size: 14px; color: #666;">
        {{ charCount() }} characters
      </text>
    </view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  text = signal('');
  charCount = computed(() => this.text().length);

  onInput(event: { detail: { value: string } }): void {
    this.text.set(event.detail.value);
  }
}

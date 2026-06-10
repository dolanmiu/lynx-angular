import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view scroll-orientation="vertical" style="height: 100%;">
      <view style="padding: 24px;">
        <text style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">
          Input Element
        </text>

        <input
          type="text"
          placeholder="Type your name..."
          style="border: 1px solid #ccc; padding: 12px; border-radius: 8px; font-size: 16px; margin-bottom: 16px;"
          (bindinput)="onInput($event)"
        />

        <text style="font-size: 16px;"> Hello, {{ name() || 'stranger' }}! </text>
      </view>
    </scroll-view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  name = signal('');

  onInput(event: Event): void {
    this.name.set((event as CustomEvent<{ value: string }>).detail.value);
  }
}

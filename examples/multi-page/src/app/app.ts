import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <view style="padding: 24px; align-items: center;">
      <text style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">
        Main Page
      </text>
      <text style="font-size: 18px; margin-bottom: 16px;">
        Count: {{ count() }}
      </text>
      <view
        style="background-color: #6200ee; padding: 12px 24px; border-radius: 8px;"
        (bindtap)="increment()"
      >
        <text style="color: white; font-size: 16px;">Tap to increment</text>
      </view>
    </view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  count = signal(0);

  increment(): void {
    this.count.update((n) => n + 1);
  }
}

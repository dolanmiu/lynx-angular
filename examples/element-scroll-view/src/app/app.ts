import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <view style="padding: 24px;">
      <text style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">
        Scroll View
      </text>

      <scroll-view
        scroll-orientation="vertical"
        style="height: 300px; border: 1px solid #e0e0e0; border-radius: 8px;"
      >
        @for (item of items(); track item) {
          <view style="padding: 16px; border-bottom: 1px solid #f0f0f0;">
            <text style="font-size: 16px;">Item {{ item }}</text>
          </view>
        }
      </scroll-view>
    </view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  items = signal(Array.from({ length: 20 }, (_, i) => i + 1));
}

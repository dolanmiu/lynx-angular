import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { Heavy } from './heavy';

@Component({
  selector: 'app-root',
  template: `
    <view style="padding: 24px;">
      <text style="font-size: 20px; font-weight: bold; margin-bottom: 16px;">
        defer Blocks
      </text>

      <view
        style="background-color: #6200ee; padding: 12px 24px; border-radius: 8px; margin-bottom: 16px;"
        (bindtap)="loadDeferred()"
      >
        <text style="color: white; font-size: 16px;">Tap to load</text>
      </view>

      @defer (when visible()) {
        <app-heavy />
      } @placeholder {
        <view
          style="background-color: #f5f5f5; padding: 16px; border-radius: 8px;"
        >
          <text style="color: #999;">Placeholder — not yet triggered</text>
        </view>
      } @loading {
        <view
          style="background-color: #fff3e0; padding: 16px; border-radius: 8px;"
        >
          <text style="color: #e65100;">Loading...</text>
        </view>
      }

      <text style="font-size: 14px; color: #666; margin-top: 16px;">
        Timer-based defer (3s):
      </text>
      @defer (on timer(3000ms)) {
        <app-heavy />
      } @placeholder {
        <view
          style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin-top: 8px;"
        >
          <text style="color: #999;">Auto-loads in 3 seconds...</text>
        </view>
      }
    </view>
  `,
  imports: [LYNX_ELEMENTS, Heavy],
})
export class App {
  readonly visible = signal(false);

  loadDeferred(): void {
    setTimeout(() => this.visible.set(true), 0);
  }
}

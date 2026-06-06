import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <view style="padding: 24px;">
      <text style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">
        Block Element
      </text>

      <view
        style="background-color: #6200ee; padding: 12px 24px; border-radius: 8px; align-items: center; margin-bottom: 16px;"
        (bindtap)="toggle()"
      >
        <text style="color: white; font-size: 16px;">Toggle Details</text>
      </view>

      <text style="font-size: 16px; margin-bottom: 8px;">Name: Angular</text>

      @if (showDetails()) {
        <block>
          <text style="font-size: 16px; margin-bottom: 8px;">
            Type: Framework
          </text>
          <text style="font-size: 16px; margin-bottom: 8px;">
            Language: TypeScript
          </text>
        </block>
      }
    </view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  showDetails = signal(false);

  toggle(): void {
    this.showDetails.update((v) => !v);
  }
}

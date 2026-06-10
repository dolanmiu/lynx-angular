import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view scroll-orientation="vertical" style="height: 100%;">
      <view style="padding: 24px;">
        <text style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">
          Image Element
        </text>

        <text style="font-size: 14px; color: #666; margin-bottom: 12px;">
          aspectFit (default)
        </text>
        <image
          src="https://angular.dev/assets/images/press-kit/angular_icon_gradient.gif"
          mode="aspectFit"
          style="width: 120px; height: 120px; margin-bottom: 16px; background-color: #f0f0f0;"
        />

        <text style="font-size: 14px; color: #666; margin-bottom: 12px;">
          aspectFill
        </text>
        <image
          src="https://angular.dev/assets/images/press-kit/angular_icon_gradient.gif"
          mode="aspectFill"
          style="width: 120px; height: 80px; background-color: #f0f0f0;"
        />
      </view>
    </scroll-view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {}

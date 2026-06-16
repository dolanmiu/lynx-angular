import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="page" scroll-orientation="vertical">
      <view class="container">
        <text class="title">Image Element</text>
        <text class="subtitle">
          Display images with different scaling modes.
        </text>

        <view class="card">
          <text class="section-label">aspectFit (default)</text>
          <view class="image-frame">
            <image
              src="https://angular.dev/assets/images/press-kit/angular_icon_gradient.gif"
              mode="aspectFit"
              class="image-fit"
            />
          </view>
        </view>

        <view class="card">
          <text class="section-label">aspectFill</text>
          <view class="image-frame">
            <image
              src="https://angular.dev/assets/images/press-kit/angular_icon_gradient.gif"
              mode="aspectFill"
              class="image-fill"
            />
          </view>
        </view>
      </view>
    </scroll-view>
  `,
  styles: `
    .page { height: 100%; background-color: #fafafa; }
    .container { padding: 24px; }
    .title { font-size: 28px; font-weight: bold; color: #18181b; margin-bottom: 4px; }
    .subtitle { font-size: 13px; color: #71717a; margin-bottom: 20px; }
    .card { background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
    .section-label { font-size: 11px; font-weight: 700; color: #a1a1aa; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .image-frame { background-color: #f4f4f5; border-radius: 8px; padding: 16px; align-items: center; }
    .image-fit { width: 120px; height: 120px; }
    .image-fill { width: 120px; height: 80px; }
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {}

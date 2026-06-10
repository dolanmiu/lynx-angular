import { Component, inject } from '@angular/core';
import {
  LYNX_ELEMENTS,
  LynxInitData,
  LynxGlobalData,
} from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view scroll-orientation="vertical" style="height: 100%;">
      <view style="padding: 24px;">
        <text style="font-size: 20px; font-weight: bold; margin-bottom: 16px;">
          Data Flow
        </text>

        <view
          style="background-color: #f0f0f0; padding: 16px; border-radius: 8px; margin-bottom: 16px;"
        >
          <text style="font-size: 14px; font-weight: bold; margin-bottom: 8px;"
            >InitData</text
          >
          <text style="font-size: 14px; color: #666;">
            {{ initDataJson() }}
          </text>
        </view>

        <view
          style="background-color: #e8f5e9; padding: 16px; border-radius: 8px;"
        >
          <text style="font-size: 14px; font-weight: bold; margin-bottom: 8px;"
            >GlobalData</text
          >
          <text style="font-size: 14px; color: #666;">
            {{ globalDataJson() }}
          </text>
        </view>
      </view>
    </scroll-view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  readonly #initData = inject(LynxInitData);
  readonly #globalData = inject(LynxGlobalData);

  initDataJson() {
    return JSON.stringify(this.#initData.initData(), null, 2);
  }

  globalDataJson() {
    return JSON.stringify(this.#globalData.globalData(), null, 2);
  }
}

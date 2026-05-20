import { Component, inject } from '@angular/core';
import {
  LYNX_ELEMENTS,
  LynxInitDataService,
  LynxGlobalPropsService,
} from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
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
          >GlobalProps</text
        >
        <text style="font-size: 14px; color: #666;">
          {{ globalPropsJson() }}
        </text>
      </view>
    </view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class AppComponent {
  readonly #initData = inject(LynxInitDataService);
  readonly #globalProps = inject(LynxGlobalPropsService);

  initDataJson() {
    return JSON.stringify(this.#initData.initData(), null, 2);
  }

  globalPropsJson() {
    return JSON.stringify(this.#globalProps.globalProps(), null, 2);
  }
}

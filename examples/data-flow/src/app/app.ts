import { Component, inject } from '@angular/core';
import {
  LYNX_ELEMENTS,
  LynxInitData,
  LynxGlobalData,
} from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="page" scroll-orientation="vertical">
      <view class="container">
        <text class="title">Data Flow</text>
        <text class="subtitle">Inject initial and global data from the Lynx runtime.</text>

        <view class="card">
          <text class="section-label">InitData</text>
          <view class="code-block">
            <text class="code-text">{{ initDataJson() }}</text>
          </view>
        </view>

        <view class="card">
          <text class="section-label">GlobalData</text>
          <view class="code-block">
            <text class="code-text">{{ globalDataJson() }}</text>
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
    .section-label { font-size: 11px; font-weight: 700; color: #a1a1aa; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    .code-block { background-color: #f4f4f5; border-radius: 8px; padding: 14px; }
    .code-text { font-size: 13px; color: #18181b; }
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

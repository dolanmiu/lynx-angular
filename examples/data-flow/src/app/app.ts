import { Component, inject } from '@angular/core';
import {
  LYNX_ELEMENTS,
  LynxInitData,
  LynxGlobalData,
} from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="h-full bg-zinc-50" scroll-orientation="vertical">
      <view class="p-6">
        <text class="text-[28px] font-bold text-zinc-900 mb-1">Data Flow</text>
        <text class="text-[13px] text-zinc-500 mb-5"
          >Inject initial and global data from the Lynx runtime.</text
        >

        <view class="bg-white border border-zinc-200 rounded-xl p-4 mb-4">
          <text
            class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-2.5"
            >InitData</text
          >
          <view class="bg-zinc-100 rounded-lg p-3.5">
            <text class="text-[13px] text-zinc-900">{{ initDataJson() }}</text>
          </view>
        </view>

        <view class="bg-white border border-zinc-200 rounded-xl p-4 mb-4">
          <text
            class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-2.5"
            >GlobalData</text
          >
          <view class="bg-zinc-100 rounded-lg p-3.5">
            <text class="text-[13px] text-zinc-900">{{
              globalDataJson()
            }}</text>
          </view>
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

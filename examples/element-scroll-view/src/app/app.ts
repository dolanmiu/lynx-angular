import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="h-full bg-zinc-50" scroll-orientation="vertical">
      <view class="p-6">
        <text class="text-[28px] font-bold text-zinc-900 mb-1"
          >Scroll View</text
        >
        <text class="text-[13px] text-zinc-500 mb-5"
          >A scrollable container for overflowing content.</text
        >

        <view
          class="bg-white border border-zinc-200 rounded-xl p-4 overflow-hidden"
        >
          <text
            class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-2.5"
            >Scrollable List</text
          >
          <scroll-view
            scroll-orientation="vertical"
            class="h-[300px] border border-zinc-200 rounded-lg"
          >
            @for (item of items(); track item) {
              <view class="px-4 py-3.5 border-b border-zinc-200">
                <text class="text-[15px] text-zinc-900">Item {{ item }}</text>
              </view>
            }
          </scroll-view>
        </view>
      </view>
    </scroll-view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  readonly items = signal(Array.from({ length: 20 }, (_, i) => i + 1));
}

import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="h-full bg-zinc-50" scroll-orientation="vertical">
      <view class="p-6">
        <text class="text-[28px] font-bold text-zinc-900 mb-1"
          >List Element</text
        >
        <text class="text-[13px] text-zinc-500 mb-5"
          >A virtualized list for efficient rendering of large datasets.</text
        >

        <view
          class="bg-white border border-zinc-200 rounded-xl p-4 overflow-hidden"
        >
          <text
            class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-2.5"
            >50 Items</text
          >
          <list
            list-type="single"
            scroll-orientation="vertical"
            class="h-[300px]"
          >
            @for (item of items(); track item.id) {
              <list-item [attr.item-key]="item.id">
                <view
                  class="py-3 border-b border-zinc-200 flex-row items-center"
                >
                  <view
                    class="w-8 h-8 rounded-[16px] bg-indigo-50 items-center justify-center"
                  >
                    <text class="text-xs font-semibold text-indigo-500">{{
                      item.id
                    }}</text>
                  </view>
                  <text class="text-[15px] text-zinc-900 ml-3">{{
                    item.name
                  }}</text>
                </view>
              </list-item>
            }
          </list>
        </view>
      </view>
    </scroll-view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  readonly items = signal(
    Array.from({ length: 50 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Item ${i + 1}`,
    })),
  );
}

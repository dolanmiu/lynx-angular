import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="h-full bg-zinc-50" scroll-orientation="vertical">
      <view class="p-6">
        <text class="mb-1 text-[28px] font-bold text-zinc-900"
          >List Element</text
        >
        <text class="mb-5 text-[13px] text-zinc-500"
          >A virtualized list for efficient rendering of large datasets.</text
        >

        <view
          class="rounded-xl border border-zinc-200 bg-white p-4 overflow-hidden"
        >
          <text
            class="uppercase mb-2.5 text-[11px] font-bold tracking-[0.5px] text-zinc-400"
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
                  class="flex-row items-center border-b border-zinc-200 py-3"
                >
                  <view
                    class="h-8 w-8 items-center rounded-[16px] bg-indigo-50 justify-center"
                  >
                    <text class="text-xs font-semibold text-indigo-500">{{
                      item.id
                    }}</text>
                  </view>
                  <text class="ml-3 text-[15px] text-zinc-900">{{
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

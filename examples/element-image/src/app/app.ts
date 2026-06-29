import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="h-full bg-zinc-50" scroll-orientation="vertical">
      <view class="p-6">
        <text class="text-[28px] font-bold text-zinc-900 mb-1"
          >Image Element</text
        >
        <text class="text-[13px] text-zinc-500 mb-5"
          >Display images with different scaling modes.</text
        >

        <view class="bg-white border border-zinc-200 rounded-xl p-4 mb-4">
          <text
            class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-3"
            >aspectFit (default)</text
          >
          <view class="bg-zinc-100 rounded-lg p-4 items-center">
            <image
              src="https://angular.dev/assets/images/press-kit/angular_icon_gradient.gif"
              mode="aspectFit"
              class="w-[120px] h-[120px]"
            />
          </view>
        </view>

        <view class="bg-white border border-zinc-200 rounded-xl p-4 mb-4">
          <text
            class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-3"
            >aspectFill</text
          >
          <view class="bg-zinc-100 rounded-lg p-4 items-center">
            <image
              src="https://angular.dev/assets/images/press-kit/angular_icon_gradient.gif"
              mode="aspectFill"
              class="w-[120px] h-[80px]"
            />
          </view>
        </view>
      </view>
    </scroll-view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {}

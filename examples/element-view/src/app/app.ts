import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="h-full bg-zinc-50" scroll-orientation="vertical">
      <view class="p-6">
        <text class="text-[28px] font-bold text-zinc-900 mb-1"
          >View Element</text
        >
        <text class="text-[13px] text-zinc-500 mb-5"
          >The basic building block for layout with flexbox support.</text
        >

        <view class="bg-white border border-zinc-200 rounded-xl p-4 mb-4">
          <text
            class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-3"
            >Card Layout</text
          >
          <view class="bg-zinc-100 rounded-[10px] p-4">
            <view class="flex-row items-center">
              <view
                class="w-10 h-10 rounded-[20px] bg-indigo-500 items-center justify-center"
              >
                <text class="text-white font-bold text-base">A</text>
              </view>
              <view class="ml-3 flex-1">
                <text class="text-base font-semibold text-zinc-900 mb-1"
                  >Card Title</text
                >
                <text class="text-[13px] text-zinc-500 leading-[18px]">
                  Views are the basic building block for layout. They support
                  flexbox properties for arranging children.
                </text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {}

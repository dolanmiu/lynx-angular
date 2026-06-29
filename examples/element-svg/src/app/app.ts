import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="h-full bg-zinc-50" scroll-orientation="vertical">
      <view class="p-6">
        <text class="text-[28px] font-bold text-zinc-900 mb-1"
          >SVG Element</text
        >
        <text class="text-[13px] text-zinc-500 mb-5"
          >Render SVG content via the content attribute.</text
        >

        <view class="bg-white border border-zinc-200 rounded-xl p-4">
          <text
            class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-3"
            >Circle</text
          >
          <view class="bg-zinc-100 rounded-lg p-5 items-center mb-3">
            <svg [attr.content]="circleSvg" class="w-[100px] h-[100px]" />
          </view>
          <text class="text-[13px] text-zinc-500 leading-[18px]">
            SVG content is passed via the content attribute as a string.
          </text>
        </view>
      </view>
    </scroll-view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  circleSvg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" fill="#6366f1" />
    <text x="50" y="55" text-anchor="middle" fill="white" font-size="16">SVG</text>
  </svg>`;
}

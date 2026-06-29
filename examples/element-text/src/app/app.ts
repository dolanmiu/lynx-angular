import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="h-full bg-zinc-50" scroll-orientation="vertical">
      <view class="p-6">
        <text class="text-[28px] font-bold text-zinc-900 mb-1"
          >Text Element</text
        >
        <text class="text-[13px] text-zinc-500 mb-5"
          >Rendering text with inline styles and truncation.</text
        >

        <view class="bg-white border border-zinc-200 rounded-xl p-4 mb-4">
          <text
            class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-2.5"
            >Inline Formatting</text
          >
          <text class="text-[15px] text-zinc-900 leading-[22px]">
            Regular text with
            <text class="font-bold"> bold </text>
            and
            <text class="text-red-500"> colored </text>
            inline content.
          </text>
        </view>

        <view class="bg-white border border-zinc-200 rounded-xl p-4 mb-4">
          <text
            class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-2.5"
            >Truncation</text
          >
          <text class="text-sm text-zinc-500 leading-5" [text-maxline]="2">
            This is a long paragraph that demonstrates text truncation with
            text-maxline. When the text exceeds two lines, it will be truncated
            with an ellipsis at the end of the second line.
          </text>
        </view>
      </view>
    </scroll-view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {}

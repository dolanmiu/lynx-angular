import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="h-full bg-zinc-50" scroll-orientation="vertical">
      <view class="p-6">
        <text class="text-[28px] font-bold text-zinc-900 mb-1"
          >Custom Fonts</text
        >
        <text class="text-[13px] text-zinc-500 mb-5"
          >Load and display custom fonts via @font-face.</text
        >

        <view class="bg-white border border-zinc-200 rounded-xl p-4 mb-4">
          <text
            class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-2.5"
            >Custom Font (Roboto)</text
          >
          <text class="text-[18px] text-zinc-900 font-[Roboto]">
            The quick brown fox jumps over the lazy dog
          </text>
        </view>

        <view class="bg-white border border-zinc-200 rounded-xl p-4 mb-4">
          <text
            class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-2.5"
            >System Font</text
          >
          <text class="text-[18px] text-zinc-900">
            The quick brown fox jumps over the lazy dog
          </text>
        </view>

        <view class="bg-white border border-zinc-200 rounded-xl p-4 mb-4">
          <text
            class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-2.5"
            >Size Scale</text
          >
          <text class="text-sm text-zinc-500 font-[Roboto] mb-2"
            >14px — ABCDEFGHIJKLMNOPQRSTUVWXYZ</text
          >
          <text class="text-[28px] text-zinc-900 font-[Roboto]"
            >28px — Hello, Lynx!</text
          >
        </view>
      </view>
    </scroll-view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {}

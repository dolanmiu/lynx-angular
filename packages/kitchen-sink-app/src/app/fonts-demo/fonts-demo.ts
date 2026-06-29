import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-fonts-demo',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  template: `
    <view class="p-4">
      <text class="text-[22px] font-bold mb-5">Custom Fonts Demo</text>

      <text class="text-[13px] text-gray-500 mt-4 mb-1"
        >Custom font (Roboto via @font-face):</text
      >
      <text class="font-[Roboto] text-[18px] mb-2">
        The quick brown fox jumps over the lazy dog
      </text>

      <text class="text-[13px] text-gray-500 mt-4 mb-1"
        >Default system font:</text
      >
      <text class="text-[18px] mb-2">
        The quick brown fox jumps over the lazy dog
      </text>

      <text class="text-[13px] text-gray-500 mt-4 mb-1"
        >Custom font at different sizes:</text
      >
      <text class="font-[Roboto] text-sm mb-1"
        >14px - ABCDEFGHIJKLMNOPQRSTUVWXYZ</text
      >
      <text class="font-[Roboto] text-[28px]">28px - Hello, Lynx!</text>
    </view>
  `,
})
export class FontsDemo {}

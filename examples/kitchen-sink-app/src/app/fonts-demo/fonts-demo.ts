import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { DemoScreen } from '../demo-screen/demo-screen';
import { ScreenHost } from '../screen-host';

@Component({
  selector: 'app-fonts-demo',
  hostDirectives: [ScreenHost],
  standalone: true,
  imports: [LYNX_ELEMENTS, DemoScreen],
  template: `
    <app-demo-screen
      heading="Custom Fonts"
      category="Platform"
      description="Loading and applying a custom font."
    >
      <view class="p-4">
        <text class="mb-1 mt-4 text-[13px] text-gray-500"
          >Custom font (Roboto via @font-face):</text
        >
        <text class="mb-2 font-[Roboto] text-[18px]">
          The quick brown fox jumps over the lazy dog
        </text>

        <text class="mb-1 mt-4 text-[13px] text-gray-500"
          >Default system font:</text
        >
        <text class="mb-2 text-[18px]">
          The quick brown fox jumps over the lazy dog
        </text>

        <text class="mb-1 mt-4 text-[13px] text-gray-500"
          >Custom font at different sizes:</text
        >
        <text class="mb-1 font-[Roboto] text-sm"
          >14px - ABCDEFGHIJKLMNOPQRSTUVWXYZ</text
        >
        <text class="font-[Roboto] text-[28px]">28px - Hello, Lynx!</text>
      </view>
    </app-demo-screen>
  `,
})
export class FontsDemo {}

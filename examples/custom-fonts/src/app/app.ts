import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <view style="padding: 24px;">
      <text style="font-size: 22px; font-weight: bold; margin-bottom: 20px;">
        Custom Fonts
      </text>

      <text style="font-size: 13px; color: #666; margin-bottom: 4px;">
        Custom font (Roboto via @font-face):
      </text>
      <text style="font-family: Roboto; font-size: 18px; margin-bottom: 16px;">
        The quick brown fox jumps over the lazy dog
      </text>

      <text style="font-size: 13px; color: #666; margin-bottom: 4px;">
        Default system font:
      </text>
      <text style="font-size: 18px; margin-bottom: 16px;">
        The quick brown fox jumps over the lazy dog
      </text>

      <text style="font-size: 13px; color: #666; margin-bottom: 4px;">
        Custom font at different sizes:
      </text>
      <text style="font-family: Roboto; font-size: 14px; margin-bottom: 4px;">
        14px — ABCDEFGHIJKLMNOPQRSTUVWXYZ
      </text>
      <text style="font-family: Roboto; font-size: 28px;">
        28px — Hello, Lynx!
      </text>
    </view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {}

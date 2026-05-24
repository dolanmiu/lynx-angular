import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-fonts-demo',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  template: `
    <view class="container">
      <text class="page-title">Custom Fonts Demo</text>

      <text class="section-label">Custom font (Roboto via @font-face):</text>
      <text class="custom-font">
        The quick brown fox jumps over the lazy dog
      </text>

      <text class="section-label">Default system font:</text>
      <text class="default-font">
        The quick brown fox jumps over the lazy dog
      </text>

      <text class="section-label">Custom font at different sizes:</text>
      <text class="custom-font-sm">14px - ABCDEFGHIJKLMNOPQRSTUVWXYZ</text>
      <text class="custom-font-lg">28px - Hello, Lynx!</text>
    </view>
  `,
  styles: [
    `
      .container {
        padding: 16px;
      }

      .page-title {
        font-size: 22px;
        font-weight: bold;
        margin-bottom: 20px;
      }

      .section-label {
        font-size: 13px;
        color: #666;
        margin-top: 16px;
        margin-bottom: 4px;
      }

      .custom-font {
        font-family: Roboto;
        font-size: 18px;
        margin-bottom: 8px;
      }

      .default-font {
        font-size: 18px;
        margin-bottom: 8px;
      }

      .custom-font-sm {
        font-family: Roboto;
        font-size: 14px;
        margin-bottom: 4px;
      }

      .custom-font-lg {
        font-family: Roboto;
        font-size: 28px;
      }
    `,
  ],
})
export class FontsDemoComponent {}

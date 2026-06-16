import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="page" scroll-orientation="vertical">
      <view class="container">
        <text class="title">Custom Fonts</text>
        <text class="subtitle">Load and display custom fonts via @font-face.</text>

        <view class="card">
          <text class="section-label">Custom Font (Roboto)</text>
          <text class="sample-custom">
            The quick brown fox jumps over the lazy dog
          </text>
        </view>

        <view class="card">
          <text class="section-label">System Font</text>
          <text class="sample-system">
            The quick brown fox jumps over the lazy dog
          </text>
        </view>

        <view class="card">
          <text class="section-label">Size Scale</text>
          <text class="scale-sm">14px — ABCDEFGHIJKLMNOPQRSTUVWXYZ</text>
          <text class="scale-lg">28px — Hello, Lynx!</text>
        </view>
      </view>
    </scroll-view>
  `,
  styles: `
    .page { height: 100%; background-color: #fafafa; }
    .container { padding: 24px; }
    .title { font-size: 28px; font-weight: bold; color: #18181b; margin-bottom: 4px; }
    .subtitle { font-size: 13px; color: #71717a; margin-bottom: 20px; }
    .card { background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
    .section-label { font-size: 11px; font-weight: 700; color: #a1a1aa; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    .sample-custom { font-family: Roboto; font-size: 18px; color: #18181b; }
    .sample-system { font-size: 18px; color: #18181b; }
    .scale-sm { font-family: Roboto; font-size: 14px; color: #71717a; margin-bottom: 8px; }
    .scale-lg { font-family: Roboto; font-size: 28px; color: #18181b; }
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {}

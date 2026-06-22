import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="page" scroll-orientation="vertical">
      <view class="container">
        <text class="title">SVG Element</text>
        <text class="subtitle">
          Render SVG content via the content attribute.
        </text>

        <view class="card">
          <text class="section-label">Circle</text>
          <view class="svg-frame">
            <svg [attr.content]="circleSvg" class="svg-icon" />
          </view>
          <text class="info">
            SVG content is passed via the content attribute as a string.
          </text>
        </view>
      </view>
    </scroll-view>
  `,
  styles: `
    .page {
      height: 100%;
      background-color: #fafafa;
    }
    .container {
      padding: 24px;
    }
    .title {
      font-size: 28px;
      font-weight: bold;
      color: #18181b;
      margin-bottom: 4px;
    }
    .subtitle {
      font-size: 13px;
      color: #71717a;
      margin-bottom: 20px;
    }
    .card {
      background-color: #ffffff;
      border: 1px solid #e4e4e7;
      border-radius: 12px;
      padding: 16px;
    }
    .section-label {
      font-size: 11px;
      font-weight: 700;
      color: #a1a1aa;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .svg-frame {
      background-color: #f4f4f5;
      border-radius: 8px;
      padding: 20px;
      align-items: center;
      margin-bottom: 12px;
    }
    .svg-icon {
      width: 100px;
      height: 100px;
    }
    .info {
      font-size: 13px;
      color: #71717a;
      line-height: 18px;
    }
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  circleSvg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" fill="#6366f1" />
    <text x="50" y="55" text-anchor="middle" fill="white" font-size="16">SVG</text>
  </svg>`;
}

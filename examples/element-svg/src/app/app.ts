import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view scroll-orientation="vertical" style="height: 100%;">
      <view style="padding: 24px;">
        <text style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">
          SVG Element
        </text>

        <svg
          [attr.content]="circleSvg"
          style="width: 100px; height: 100px; margin-bottom: 16px;"
        />

        <text style="font-size: 14px; color: #666;">
          SVG content is passed via the content attribute as a string.
        </text>
      </view>
    </scroll-view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  circleSvg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" fill="#6200ee" />
    <text x="50" y="55" text-anchor="middle" fill="white" font-size="16">SVG</text>
  </svg>`;
}

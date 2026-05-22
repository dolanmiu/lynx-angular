import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-heavy',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  template: `
    <view class="heavy-container">
      <text class="heavy-title">Heavy Component Loaded!</text>
      <text class="heavy-body"
        >This component was loaded via @defer. It lives in a separate file so
        Angular generates a dynamic import() for it.</text
      >
    </view>
  `,
  styles: [
    `
      .heavy-container {
        padding: 16px;
        background-color: #e8f5e9;
        border-radius: 8px;
        border: 2px solid #4caf50;
      }

      .heavy-title {
        font-size: 16px;
        font-weight: bold;
        color: #2e7d32;
        margin-bottom: 8px;
      }

      .heavy-body {
        font-size: 13px;
        color: #388e3c;
      }
    `,
  ],
})
export class HeavyComponent {}

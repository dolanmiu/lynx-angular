import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="page" scroll-orientation="vertical">
      <view class="container">
        <text class="title">Scroll View</text>
        <text class="subtitle">
          A scrollable container for overflowing content.
        </text>

        <view class="card">
          <text class="section-label">Scrollable List</text>
          <scroll-view scroll-orientation="vertical" class="scroll-area">
            @for (item of items(); track item) {
              <view class="scroll-item">
                <text class="scroll-item-text">Item {{ item }}</text>
              </view>
            }
          </scroll-view>
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
      overflow: hidden;
    }
    .section-label {
      font-size: 11px;
      font-weight: 700;
      color: #a1a1aa;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .scroll-area {
      height: 300px;
      border: 1px solid #e4e4e7;
      border-radius: 8px;
    }
    .scroll-item {
      padding: 14px 16px;
      border-bottom: 1px solid #e4e4e7;
    }
    .scroll-item-text {
      font-size: 15px;
      color: #18181b;
    }
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  readonly items = signal(Array.from({ length: 20 }, (_, i) => i + 1));
}

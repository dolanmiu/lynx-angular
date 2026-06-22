import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="page" scroll-orientation="vertical">
      <view class="container">
        <text class="title">Title Bar View</text>
        <text class="subtitle">
          A custom frameless window title bar with draggable regions.
        </text>

        <view class="card">
          <text class="section-label">Title Bar</text>
          <view class="title-bar">
            <title-bar-view moveable="true" class="title-bar-drag">
              <text class="title-bar-text">My App</text>
            </title-bar-view>
            <view class="close-btn" (bindtap)="close()">
              <text class="close-icon">✕</text>
            </view>
          </view>
        </view>

        <view class="info-card">
          <text class="info-text">{{ message() }}</text>
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
      margin-bottom: 16px;
    }
    .section-label {
      font-size: 11px;
      font-weight: 700;
      color: #a1a1aa;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .title-bar {
      height: 44px;
      flex-direction: row;
      align-items: center;
      background-color: #f4f4f5;
      border-radius: 8px;
      overflow: hidden;
    }
    .title-bar-drag {
      flex: 1;
      height: 100%;
      justify-content: center;
    }
    .title-bar-text {
      font-size: 14px;
      font-weight: 600;
      color: #18181b;
      padding-left: 14px;
    }
    .close-btn {
      width: 44px;
      height: 100%;
      align-items: center;
      justify-content: center;
      border-left: 1px solid #e4e4e7;
    }
    .close-icon {
      font-size: 14px;
      color: #71717a;
    }
    .info-card {
      background-color: #f4f4f5;
      border-radius: 12px;
      padding: 14px;
    }
    .info-text {
      font-size: 13px;
      color: #71717a;
    }
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  readonly message = signal('Drag the title bar to move the window.');

  close(): void {
    this.message.set('Close button tapped!');
  }
}

import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { Heavy } from './heavy';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="page" scroll-orientation="vertical">
      <view class="container">
        <text class="title">defer Blocks</text>
        <text class="subtitle"
          >Lazy-load components with declarative triggers.</text
        >

        <view class="card">
          <text class="section-label">Tap to Load</text>
          <view class="btn" (bindtap)="loadDeferred()">
            <text class="btn-text">Tap to load</text>
          </view>

          @defer (when visible()) {
            <app-heavy />
          } @placeholder {
            <view class="placeholder">
              <text class="placeholder-text"
                >Placeholder — not yet triggered</text
              >
            </view>
          } @loading {
            <view class="loading">
              <text class="loading-text">Loading...</text>
            </view>
          }
        </view>

        <view class="card">
          <text class="section-label">Timer-based (3s)</text>
          @defer (on timer(3000ms)) {
            <app-heavy />
          } @placeholder {
            <view class="placeholder">
              <text class="placeholder-text">Auto-loads in 3 seconds...</text>
            </view>
          }
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
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .btn {
      background-color: #6366f1;
      padding: 12px 24px;
      border-radius: 8px;
      align-items: center;
      margin-bottom: 12px;
    }
    .btn-text {
      color: white;
      font-size: 15px;
      font-weight: 600;
    }
    .placeholder {
      background-color: #f4f4f5;
      padding: 14px;
      border-radius: 8px;
    }
    .placeholder-text {
      color: #a1a1aa;
      font-size: 14px;
    }
    .loading {
      background-color: #fffbeb;
      padding: 14px;
      border-radius: 8px;
    }
    .loading-text {
      color: #92400e;
      font-size: 14px;
    }
  `,
  imports: [LYNX_ELEMENTS, Heavy],
})
export class App {
  readonly visible = signal(false);

  loadDeferred(): void {
    setTimeout(() => this.visible.set(true), 0);
  }
}

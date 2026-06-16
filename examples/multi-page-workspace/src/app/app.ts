import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="page" scroll-orientation="vertical">
      <view class="container">
        <text class="title">Home Page</text>
        <text class="subtitle">
          This page is the "home" project in angular.json.
        </text>

        <view class="card">
          <text class="count">{{ count() }}</text>
          <text class="label">taps</text>
        </view>

        <view class="btn" (bindtap)="increment()">
          <text class="btn-text">Tap to increment</text>
        </view>
      </view>
    </scroll-view>
  `,
  styles: `
    .page { height: 100%; background-color: #fafafa; }
    .container { padding: 24px; align-items: center; }
    .title { font-size: 28px; font-weight: bold; color: #18181b; margin-bottom: 4px; }
    .subtitle { font-size: 13px; color: #71717a; margin-bottom: 24px; text-align: center; }
    .card { background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; padding: 24px 40px; align-items: center; margin-bottom: 20px; }
    .count { font-size: 48px; font-weight: bold; color: #6366f1; }
    .label { font-size: 13px; color: #a1a1aa; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }
    .btn { background-color: #6366f1; padding: 14px 32px; border-radius: 10px; align-items: center; }
    .btn-text { color: white; font-size: 16px; font-weight: 600; }
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  readonly count = signal(0);

  increment(): void {
    this.count.update((n) => n + 1);
  }
}

import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="page" scroll-orientation="vertical">
      <view class="container">
        <view class="hero">
          <text class="badge">AngularLynx</text>
          <text class="title">Hello, Lynx!</text>
          <text class="subtitle">
            Tap the button to see signals in action.
          </text>
        </view>

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
    .container { padding: 24px; align-items: center; justify-content: center; min-height: 100%; }
    .hero { align-items: center; margin-bottom: 32px; }
    .badge { font-size: 11px; font-weight: 700; color: #6366f1; background-color: #eef2ff; padding: 4px 12px; border-radius: 20px; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 16px; }
    .title { font-size: 32px; font-weight: bold; color: #18181b; margin-bottom: 6px; }
    .subtitle { font-size: 15px; color: #71717a; text-align: center; }
    .card { background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; padding: 32px 48px; align-items: center; margin-bottom: 24px; }
    .count { font-size: 64px; font-weight: bold; color: #6366f1; }
    .label { font-size: 14px; color: #a1a1aa; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }
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

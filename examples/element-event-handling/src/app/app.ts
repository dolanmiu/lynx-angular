import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="page" scroll-orientation="vertical">
      <view class="container">
        <text class="title">Event Handling</text>
        <text class="subtitle">
          Tap the outer or inner box to see how events propagate.
        </text>

        <view class="card">
          <text class="section-label">Propagation Demo</text>
          <view class="outer-box" (bindtap)="onOuterTap()">
            <text class="outer-label">Outer (bindtap — bubbles)</text>
            <view class="inner-box" (catchtap)="onInnerTap()">
              <text class="inner-label">
                Inner (catchtap — stops propagation)
              </text>
            </view>
          </view>
        </view>

        <view class="card">
          <text class="section-label">Event Log</text>
          @for (entry of log(); track $index) {
            <text class="log-entry">{{ entry }}</text>
          } @empty {
            <text class="log-empty">Tap a box to see events</text>
          }
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
    .section-label { font-size: 11px; font-weight: 700; color: #a1a1aa; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .outer-box { background-color: #eef2ff; padding: 20px; border-radius: 10px; align-items: center; }
    .outer-label { font-size: 13px; color: #4338ca; margin-bottom: 12px; }
    .inner-box { background-color: #6366f1; padding: 14px 24px; border-radius: 8px; }
    .inner-label { color: white; font-size: 13px; }
    .log-entry { font-size: 13px; color: #18181b; margin-bottom: 4px; }
    .log-empty { font-size: 13px; color: #a1a1aa; }
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  readonly log = signal<string[]>([]);

  onOuterTap(): void {
    this.log.update((entries) => [...entries.slice(-4), 'Outer tapped (bind)']);
  }

  onInnerTap(): void {
    this.log.update((entries) => [
      ...entries.slice(-4),
      'Inner tapped (catch — stopped)',
    ]);
  }
}

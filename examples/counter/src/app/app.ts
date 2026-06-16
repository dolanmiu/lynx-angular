import { Component, computed, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  imports: [LYNX_ELEMENTS],
  template: `
    <view class="page">
      <text class="title">Counter</text>
      <text class="subtitle">Signal-based reactivity with computed state.</text>

      <view class="card">
        <text class="count">{{ count() }}</text>
        <text class="label">{{ label() }}</text>
      </view>

      <view class="row">
        <view class="btn" (bindtap)="decrement()">
          <text class="btn-text">−</text>
        </view>
        <view class="btn btn-secondary" (bindtap)="reset()">
          <text class="btn-text btn-secondary-text">Reset</text>
        </view>
        <view class="btn" (bindtap)="increment()">
          <text class="btn-text">+</text>
        </view>
      </view>
    </view>
  `,
  styles: `
    .page { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background-color: #fafafa; padding: 24px; }
    .title { font-size: 28px; font-weight: bold; color: #18181b; margin-bottom: 4px; }
    .subtitle { font-size: 13px; color: #71717a; margin-bottom: 32px; }
    .card { background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; padding: 32px 48px; align-items: center; margin-bottom: 32px; }
    .count { font-size: 72px; font-weight: bold; color: #6366f1; margin-bottom: 4px; }
    .label { font-size: 14px; color: #a1a1aa; }
    .row { display: flex; flex-direction: row; gap: 12px; }
    .btn { background-color: #6366f1; border-radius: 10px; padding: 16px 28px; }
    .btn-text { color: white; font-size: 24px; font-weight: bold; }
    .btn-secondary { background-color: #f4f4f5; border: 1px solid #e4e4e7; }
    .btn-secondary-text { color: #18181b; font-size: 16px; }
  `,
})
export class App {
  readonly count = signal(0);
  readonly label = computed(() => {
    const n = this.count();
    if (n === 0) return 'Tap + or − to start';
    return n > 0 ? `${n} above zero` : `${Math.abs(n)} below zero`;
  });

  increment(): void { this.count.update((n) => n + 1); }
  decrement(): void { this.count.update((n) => n - 1); }
  reset(): void { this.count.set(0); }
}

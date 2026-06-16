import { Component, inject, signal } from '@angular/core';
import { LYNX_ELEMENTS, LynxSessionStorage } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="page" scroll-orientation="vertical">
      <view class="container">
        <text class="title">Session Storage</text>
        <text class="subtitle">Persist state across Lynx pages with reactive watching.</text>

        <view class="card">
          <text class="section-label">Counter</text>
          <text class="counter-value">{{ counter() ?? 'not set' }}</text>
          <view class="btn-row">
            <view class="btn" (bindtap)="increment()">
              <text class="btn-text">Increment</text>
            </view>
            <view class="btn btn-destructive" (bindtap)="reset()">
              <text class="btn-text">Reset</text>
            </view>
          </view>
        </view>

        <view class="card">
          <text class="section-label">One-time Read</text>
          <text class="read-value">Last read: {{ lastRead() }}</text>
          <view class="btn btn-secondary" (bindtap)="readOnce()">
            <text class="btn-text btn-secondary-text">Read Once</text>
          </view>
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
    .section-label { font-size: 11px; font-weight: 700; color: #a1a1aa; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    .counter-value { font-size: 24px; font-weight: bold; color: #18181b; margin-bottom: 12px; }
    .btn-row { flex-direction: row; gap: 12px; }
    .btn { background-color: #6366f1; padding: 12px 24px; border-radius: 10px; align-items: center; }
    .btn-text { color: white; font-size: 15px; font-weight: 600; }
    .btn-destructive { background-color: #ef4444; }
    .btn-secondary { background-color: #f4f4f5; border: 1px solid #e4e4e7; }
    .btn-secondary-text { color: #18181b; }
    .read-value { font-size: 15px; color: #18181b; margin-bottom: 12px; }
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  readonly #sessionStorage = inject(LynxSessionStorage);

  readonly counter = this.#sessionStorage.watch<number>('counter');
  readonly lastRead = signal<string>('(not yet read)');

  increment(): void {
    const current = this.counter() ?? 0;
    this.#sessionStorage.setItem('counter', current + 1);
  }

  reset(): void {
    this.#sessionStorage.setItem('counter', 0);
  }

  async readOnce(): Promise<void> {
    try {
      const value = await this.#sessionStorage.getItem<number>('counter');
      this.lastRead.set(`counter = ${value ?? 'not set'}`);
    } catch {
      this.lastRead.set('(not available)');
    }
  }
}

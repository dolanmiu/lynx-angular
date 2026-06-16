import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="page" scroll-orientation="vertical">
      <view class="container">
        <text class="title">Error Handling</text>
        <text class="subtitle">Catch and display runtime errors via __lynxLastError.</text>

        <view class="btn" (bindtap)="throwError()">
          <text class="btn-text">Throw an Error</text>
        </view>

        <view class="card">
          <text class="section-label">__lynxLastError</text>
          <view class="error-block" [class.error-active]="!!lastError()">
            <text class="error-text">{{ lastError() || '(none)' }}</text>
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
    .btn { background-color: #6366f1; padding: 12px 24px; border-radius: 10px; align-items: center; margin-bottom: 16px; }
    .btn-text { color: white; font-size: 15px; font-weight: 600; }
    .card { background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 16px; }
    .section-label { font-size: 11px; font-weight: 700; color: #a1a1aa; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    .error-block { background-color: #f4f4f5; border-radius: 8px; padding: 14px; }
    .error-active { background-color: #fef2f2; }
    .error-text { font-size: 12px; color: #71717a; word-break: break-all; }
    .error-active .error-text { color: #991b1b; }
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  readonly lastError = signal('');

  throwError(): void {
    setTimeout(() => {
      try {
        throw new Error('Example error from component');
      } catch (e) {
        const err = e as Error;
        (globalThis as any).__lynxLastError =
          `${err.name}: ${err.message}\n${err.stack ?? ''}`;
        this.lastError.set((globalThis as any).__lynxLastError);
      }
    }, 0);
  }
}

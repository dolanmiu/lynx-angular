import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view scroll-orientation="vertical" style="height: 100%;">
      <view style="padding: 24px;">
        <text style="font-size: 20px; font-weight: bold; margin-bottom: 16px;">
          Error Handling
        </text>

        <view
          style="background-color: #6200ee; padding: 12px 24px; border-radius: 8px; margin-bottom: 16px;"
          (bindtap)="throwError()"
        >
          <text style="color: white; font-size: 16px;">Throw an Error</text>
        </view>

        <view
          style="background-color: #f5f5f5; padding: 16px; border-radius: 8px;"
        >
          <text style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">
            __lynxLastError:
          </text>
          <text style="font-size: 12px; color: #c62828; word-break: break-all;">
            {{ lastError() || '(none)' }}
          </text>
        </view>
      </view>
    </scroll-view>
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

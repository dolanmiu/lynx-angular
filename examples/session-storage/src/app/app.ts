import { Component, inject, signal } from '@angular/core';
import { LYNX_ELEMENTS, LynxSessionStorageService } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <view style="padding: 24px;">
      <text style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">
        Session Storage
      </text>

      <view style="margin-bottom: 24px;">
        <text style="font-size: 18px; margin-bottom: 8px;">
          Counter: {{ counter() ?? 'not set' }}
        </text>
        <view style="flex-direction: row; gap: 12px;">
          <view
            style="background-color: #6200ee; padding: 12px 24px; border-radius: 8px;"
            (bindtap)="increment()"
          >
            <text style="color: white; font-size: 16px;">Increment</text>
          </view>
          <view
            style="background-color: #b00020; padding: 12px 24px; border-radius: 8px;"
            (bindtap)="reset()"
          >
            <text style="color: white; font-size: 16px;">Reset</text>
          </view>
        </view>
      </view>

      <view>
        <text style="font-size: 18px; margin-bottom: 8px;">
          Last read: {{ lastRead() }}
        </text>
        <view
          style="background-color: #03dac6; padding: 12px 24px; border-radius: 8px;"
          (bindtap)="readOnce()"
        >
          <text style="color: black; font-size: 16px;">Read Once</text>
        </view>
      </view>
    </view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  readonly #sessionStorage = inject(LynxSessionStorageService);

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

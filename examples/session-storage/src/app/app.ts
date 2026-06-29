import { Component, inject, signal } from '@angular/core';
import { LYNX_ELEMENTS, LynxSessionStorage } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="h-full bg-zinc-50" scroll-orientation="vertical">
      <view class="p-6">
        <text class="text-[28px] font-bold text-zinc-900 mb-1"
          >Session Storage</text
        >
        <text class="text-[13px] text-zinc-500 mb-5"
          >Persist state across Lynx pages with reactive watching.</text
        >

        <view class="bg-white border border-zinc-200 rounded-xl p-4 mb-4">
          <text
            class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-2.5"
            >Counter</text
          >
          <text class="text-[24px] font-bold text-zinc-900 mb-3">{{
            counter() ?? 'not set'
          }}</text>
          <view class="flex flex-row gap-3">
            <view
              class="bg-indigo-500 py-3 px-6 rounded-[10px] items-center"
              (bindtap)="increment()"
            >
              <text class="text-white text-[15px] font-semibold"
                >Increment</text
              >
            </view>
            <view
              class="bg-red-500 py-3 px-6 rounded-[10px] items-center"
              (bindtap)="reset()"
            >
              <text class="text-white text-[15px] font-semibold">Reset</text>
            </view>
          </view>
        </view>

        <view class="bg-white border border-zinc-200 rounded-xl p-4 mb-4">
          <text
            class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-2.5"
            >One-time Read</text
          >
          <text class="text-[15px] text-zinc-900 mb-3"
            >Last read: {{ lastRead() }}</text
          >
          <view
            class="bg-zinc-100 border border-zinc-200 py-3 px-6 rounded-[10px] items-center"
            (bindtap)="readOnce()"
          >
            <text class="text-zinc-900 text-[15px] font-semibold"
              >Read Once</text
            >
          </view>
        </view>
      </view>
    </scroll-view>
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

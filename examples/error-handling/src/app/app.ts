import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="h-full bg-zinc-50" scroll-orientation="vertical">
      <view class="p-6">
        <text class="text-[28px] font-bold text-zinc-900 mb-1"
          >Error Handling</text
        >
        <text class="text-[13px] text-zinc-500 mb-5"
          >Catch and display runtime errors via __lynxLastError.</text
        >

        <view
          class="bg-indigo-500 py-3 px-6 rounded-[10px] items-center mb-4"
          (bindtap)="throwError()"
        >
          <text class="text-white text-[15px] font-semibold"
            >Throw an Error</text
          >
        </view>

        <view class="bg-white border border-zinc-200 rounded-xl p-4">
          <text
            class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-2.5"
            >__lynxLastError</text
          >
          <view
            class="bg-zinc-100 rounded-lg p-3.5"
            [class.bg-red-50]="!!lastError()"
          >
            <text
              class="text-xs text-zinc-500 break-all"
              [class.text-red-800]="!!lastError()"
              >{{ lastError() || '(none)' }}</text
            >
          </view>
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

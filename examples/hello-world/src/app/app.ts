import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="h-full bg-zinc-50" scroll-orientation="vertical">
      <view class="p-6 items-center justify-center min-h-full">
        <view class="items-center mb-8">
          <text
            class="text-[11px] font-bold text-indigo-500 bg-indigo-50 py-1 px-3 rounded-[20px] tracking-[0.5px] uppercase mb-4"
            >AngularLynx</text
          >
          <text class="text-[32px] font-bold text-zinc-900 mb-1.5"
            >Hello, Lynx!</text
          >
          <text class="text-[15px] text-zinc-500 text-center"
            >Tap the button to see signals in action.</text
          >
        </view>

        <view
          class="bg-white border border-zinc-200 rounded-2xl px-12 py-8 items-center mb-6"
        >
          <text class="text-[64px] font-bold text-indigo-500">{{
            count()
          }}</text>
          <text class="text-sm text-zinc-400 mt-1 uppercase tracking-[1px]"
            >taps</text
          >
        </view>

        <view
          class="bg-indigo-500 py-3.5 px-8 rounded-[10px] items-center"
          (bindtap)="increment()"
        >
          <text class="text-white text-base font-semibold"
            >Tap to increment</text
          >
        </view>
      </view>
    </scroll-view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  readonly count = signal(0);

  increment(): void {
    this.count.update((n) => n + 1);
  }
}

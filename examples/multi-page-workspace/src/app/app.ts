import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="h-full bg-zinc-50" scroll-orientation="vertical">
      <view class="p-6 items-center">
        <text class="text-[28px] font-bold text-zinc-900 mb-1">Home Page</text>
        <text class="text-[13px] text-zinc-500 mb-6 text-center"
          >This page is the "home" project in angular.json.</text
        >

        <view
          class="bg-white border border-zinc-200 rounded-2xl px-10 py-6 items-center mb-5"
        >
          <text class="text-[48px] font-bold text-indigo-500">{{
            count()
          }}</text>
          <text class="text-[13px] text-zinc-400 mt-1 uppercase tracking-[1px]"
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

import { Component, computed, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  imports: [LYNX_ELEMENTS],
  template: `
    <view
      class="flex flex-col items-center justify-center h-screen bg-zinc-50 p-6"
    >
      <text class="text-[28px] font-bold text-zinc-900 mb-1">Counter</text>
      <text class="text-[13px] text-zinc-500 mb-8"
        >Signal-based reactivity with computed state.</text
      >

      <view
        class="bg-white border border-zinc-200 rounded-2xl px-12 py-8 items-center mb-8"
      >
        <text class="text-[72px] font-bold text-indigo-500 mb-1">{{
          count()
        }}</text>
        <text class="text-sm text-zinc-400">{{ label() }}</text>
      </view>

      <view class="flex flex-row gap-3">
        <view
          class="bg-indigo-500 rounded-[10px] px-7 py-4"
          (bindtap)="decrement()"
        >
          <text class="text-white text-2xl font-bold">-</text>
        </view>
        <view
          class="bg-zinc-100 border border-zinc-200 rounded-[10px] px-7 py-4"
          (bindtap)="reset()"
        >
          <text class="text-zinc-900 text-base font-bold">Reset</text>
        </view>
        <view
          class="bg-indigo-500 rounded-[10px] px-7 py-4"
          (bindtap)="increment()"
        >
          <text class="text-white text-2xl font-bold">+</text>
        </view>
      </view>
    </view>
  `,
})
export class App {
  readonly count = signal(0);
  readonly label = computed(() => {
    const n = this.count();
    if (n === 0) return 'Tap + or − to start';
    return n > 0 ? `${n} above zero` : `${Math.abs(n)} below zero`;
  });

  increment(): void {
    this.count.update((n) => n + 1);
  }
  decrement(): void {
    this.count.update((n) => n - 1);
  }
  reset(): void {
    this.count.set(0);
  }
}

import { Component, computed, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  imports: [LYNX_ELEMENTS],
  template: `
    <view
      class="h-screen flex-col items-center bg-zinc-50 p-6 flex justify-center"
    >
      <text class="mb-1 text-[28px] font-bold text-zinc-900">Counter</text>
      <text class="mb-8 text-[13px] text-zinc-500"
        >Signal-based reactivity with computed state.</text
      >

      <view
        class="mb-8 items-center rounded-2xl border border-zinc-200 bg-white px-12 py-8"
      >
        <text class="mb-1 text-[72px] font-bold text-indigo-500">{{
          count()
        }}</text>
        <text class="text-sm text-zinc-400">{{ label() }}</text>
      </view>

      <view class="flex-row gap-3 flex">
        <view
          class="rounded-[10px] bg-indigo-500 px-7 py-4"
          (bindtap)="decrement()"
        >
          <text class="text-2xl font-bold text-white">-</text>
        </view>
        <view
          class="rounded-[10px] border border-zinc-200 bg-zinc-100 px-7 py-4"
          (bindtap)="reset()"
        >
          <text class="text-base font-bold text-zinc-900">Reset</text>
        </view>
        <view
          class="rounded-[10px] bg-indigo-500 px-7 py-4"
          (bindtap)="increment()"
        >
          <text class="text-2xl font-bold text-white">+</text>
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

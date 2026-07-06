import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-tailwind-demo',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  // No styleUrl — all styling comes from the global Tailwind utilities in styles.css.
  // styles.css is injected via angular.json → source.preEntry in the build pipeline.
  template: `
    <scroll-view class="w-full" scroll-orientation="vertical">
      <view class="flex-col p-4 flex">
        <text class="mb-4 text-xl font-bold text-white">Tailwind CSS Demo</text>

        <!-- Color palette -->
        <text class="mb-2 text-lg font-semibold text-white">Colors</text>
        <view class="mb-6 flex-col flex">
          <view class="mb-2 rounded-lg bg-blue-500 p-4">
            <text class="font-bold text-white">bg-blue-500</text>
          </view>
          <view class="mb-2 rounded-lg bg-emerald-500 p-4">
            <text class="font-bold text-white">bg-emerald-500</text>
          </view>
          <view class="mb-2 rounded-lg bg-rose-500 p-4">
            <text class="font-bold text-white">bg-rose-500</text>
          </view>
          <view class="mb-2 rounded-lg bg-amber-400 p-4">
            <text class="font-bold text-zinc-900">bg-amber-400</text>
          </view>
        </view>

        <!-- Spacing -->
        <text class="mb-2 text-lg font-semibold text-white">Spacing</text>
        <view class="mb-6 flex-col flex">
          <view class="mb-1 rounded bg-slate-700 p-2">
            <text class="text-white">p-2</text>
          </view>
          <view class="mb-1 rounded bg-slate-700 p-4">
            <text class="text-white">p-4</text>
          </view>
          <view class="mb-1 rounded bg-slate-700 p-8">
            <text class="text-white">p-8</text>
          </view>
        </view>

        <!-- Typography -->
        <text class="mb-2 text-lg font-semibold text-white">Typography</text>
        <view class="mb-6 flex-col rounded-lg bg-slate-800 p-4 flex">
          <text class="mb-1 text-xs text-slate-400">text-xs</text>
          <text class="mb-1 text-sm text-slate-400">text-sm</text>
          <text class="mb-1 text-base text-white">text-base</text>
          <text class="mb-1 text-lg text-white">text-lg</text>
          <text class="mb-1 text-xl font-bold text-white"
            >text-xl font-bold</text
          >
          <text class="text-2xl font-bold text-white">text-2xl font-bold</text>
        </view>

        <!-- Interactive counter -->
        <text class="mb-2 text-lg font-semibold text-white">Interactive</text>
        <view class="mb-6 flex-col items-center flex">
          <text class="mb-4 text-4xl font-bold text-white">{{ count() }}</text>
          <view class="w-full flex-col flex">
            <view
              class="mb-2 items-center rounded-lg bg-blue-600 p-4"
              (bindtap)="increment()"
            >
              <text class="font-semibold text-white">+ Increment</text>
            </view>
            <view
              class="items-center rounded-lg bg-slate-600 p-4"
              (bindtap)="resetCount()"
            >
              <text class="font-semibold text-white">Reset</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  `,
})
export class TailwindDemo {
  count = signal(0);

  increment(): void {
    this.count.update((n) => n + 1);
  }

  resetCount(): void {
    this.count.set(0);
  }
}

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
      <view class="p-4 flex flex-col">
        <text class="text-xl font-bold mb-4 text-white">Tailwind CSS Demo</text>

        <!-- Color palette -->
        <text class="text-lg font-semibold mb-2 text-white">Colors</text>
        <view class="flex flex-col mb-6">
          <view class="bg-blue-500 p-4 rounded-lg mb-2">
            <text class="text-white font-bold">bg-blue-500</text>
          </view>
          <view class="bg-emerald-500 p-4 rounded-lg mb-2">
            <text class="text-white font-bold">bg-emerald-500</text>
          </view>
          <view class="bg-rose-500 p-4 rounded-lg mb-2">
            <text class="text-white font-bold">bg-rose-500</text>
          </view>
          <view class="bg-amber-400 p-4 rounded-lg mb-2">
            <text class="font-bold" style="color: #1a1a1a;">bg-amber-400</text>
          </view>
        </view>

        <!-- Spacing -->
        <text class="text-lg font-semibold mb-2 text-white">Spacing</text>
        <view class="flex flex-col mb-6">
          <view class="bg-slate-700 p-2 mb-1 rounded">
            <text class="text-white">p-2</text>
          </view>
          <view class="bg-slate-700 p-4 mb-1 rounded">
            <text class="text-white">p-4</text>
          </view>
          <view class="bg-slate-700 p-8 mb-1 rounded">
            <text class="text-white">p-8</text>
          </view>
        </view>

        <!-- Typography -->
        <text class="text-lg font-semibold mb-2 text-white">Typography</text>
        <view class="bg-slate-800 p-4 rounded-lg mb-6 flex flex-col">
          <text class="text-xs mb-1 text-slate-400">text-xs</text>
          <text class="text-sm mb-1 text-slate-400">text-sm</text>
          <text class="text-base mb-1 text-white">text-base</text>
          <text class="text-lg mb-1 text-white">text-lg</text>
          <text class="text-xl mb-1 font-bold text-white"
            >text-xl font-bold</text
          >
          <text class="text-2xl font-bold text-white">text-2xl font-bold</text>
        </view>

        <!-- Interactive counter -->
        <text class="text-lg font-semibold mb-2 text-white">Interactive</text>
        <view class="flex flex-col items-center mb-6">
          <text class="text-4xl font-bold mb-4 text-white">{{ count() }}</text>
          <view class="flex flex-col w-full">
            <view
              class="bg-blue-600 p-4 rounded-lg mb-2 items-center"
              (bindtap)="increment()"
            >
              <text class="text-white font-semibold">+ Increment</text>
            </view>
            <view
              class="bg-slate-600 p-4 rounded-lg items-center"
              (bindtap)="resetCount()"
            >
              <text class="text-white font-semibold">Reset</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  `,
})
export class TailwindDemoComponent {
  count = signal(0);

  increment(): void {
    this.count.update((n) => n + 1);
  }

  resetCount(): void {
    this.count.set(0);
  }
}

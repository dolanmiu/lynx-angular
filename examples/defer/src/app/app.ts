import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { Heavy } from './heavy';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="h-full bg-zinc-50" scroll-orientation="vertical">
      <view class="p-6">
        <text class="text-[28px] font-bold text-zinc-900 mb-1"
          >defer Blocks</text
        >
        <text class="text-[13px] text-zinc-500 mb-5"
          >Lazy-load components with declarative triggers.</text
        >

        <view class="bg-white border border-zinc-200 rounded-xl p-4 mb-4">
          <text
            class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-3"
            >Tap to Load</text
          >
          <view
            class="bg-indigo-500 py-3 px-6 rounded-lg items-center mb-3"
            (bindtap)="loadDeferred()"
          >
            <text class="text-white text-[15px] font-semibold"
              >Tap to load</text
            >
          </view>

          @defer (when visible()) {
            <app-heavy />
          } @placeholder {
            <view class="bg-zinc-100 p-3.5 rounded-lg">
              <text class="text-sm text-zinc-400"
                >Placeholder — not yet triggered</text
              >
            </view>
          } @loading {
            <view class="bg-amber-50 p-3.5 rounded-lg">
              <text class="text-sm text-amber-800">Loading...</text>
            </view>
          }
        </view>

        <view class="bg-white border border-zinc-200 rounded-xl p-4 mb-4">
          <text
            class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-3"
            >Timer-based (3s)</text
          >
          @defer (on timer(3000ms)) {
            <app-heavy />
          } @placeholder {
            <view class="bg-zinc-100 p-3.5 rounded-lg">
              <text class="text-sm text-zinc-400"
                >Auto-loads in 3 seconds...</text
              >
            </view>
          }
        </view>
      </view>
    </scroll-view>
  `,
  imports: [LYNX_ELEMENTS, Heavy],
})
export class App {
  readonly visible = signal(false);

  loadDeferred(): void {
    setTimeout(() => this.visible.set(true), 0);
  }
}

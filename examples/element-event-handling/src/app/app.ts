import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="h-full bg-zinc-50" scroll-orientation="vertical">
      <view class="p-6">
        <text class="text-[28px] font-bold text-zinc-900 mb-1"
          >Event Handling</text
        >
        <text class="text-[13px] text-zinc-500 mb-5"
          >Tap the outer or inner box to see how events propagate.</text
        >

        <view class="bg-white border border-zinc-200 rounded-xl p-4 mb-4">
          <text
            class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-3"
            >Propagation Demo</text
          >
          <view
            class="bg-indigo-50 p-5 rounded-[10px] items-center"
            (bindtap)="onOuterTap()"
          >
            <text class="text-[13px] text-indigo-700 mb-3"
              >Outer (bindtap — bubbles)</text
            >
            <view
              class="bg-indigo-500 py-3.5 px-6 rounded-lg"
              (catchtap)="onInnerTap()"
            >
              <text class="text-white text-[13px]"
                >Inner (catchtap — stops propagation)</text
              >
            </view>
          </view>
        </view>

        <view class="bg-white border border-zinc-200 rounded-xl p-4 mb-4">
          <text
            class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-3"
            >Event Log</text
          >
          @for (entry of log(); track $index) {
            <text class="text-[13px] text-zinc-900 mb-1">{{ entry }}</text>
          } @empty {
            <text class="text-[13px] text-zinc-400"
              >Tap a box to see events</text
            >
          }
        </view>
      </view>
    </scroll-view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  readonly log = signal<string[]>([]);

  onOuterTap(): void {
    this.log.update((entries) => [...entries.slice(-4), 'Outer tapped (bind)']);
  }

  onInnerTap(): void {
    this.log.update((entries) => [
      ...entries.slice(-4),
      'Inner tapped (catch — stopped)',
    ]);
  }
}

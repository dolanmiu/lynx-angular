import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="h-full bg-zinc-50" scroll-orientation="vertical">
      <view class="p-6">
        <text class="text-[28px] font-bold text-zinc-900 mb-1"
          >Block Element</text
        >
        <text class="text-[13px] text-zinc-500 mb-5"
          >A non-visual container for conditional rendering.</text
        >

        <view
          class="bg-indigo-500 py-3 px-6 rounded-[10px] items-center mb-4"
          (bindtap)="toggle()"
        >
          <text class="text-white text-[15px] font-semibold"
            >Toggle Details</text
          >
        </view>

        <view class="bg-white border border-zinc-200 rounded-xl p-4">
          <text
            class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-2.5"
            >Properties</text
          >
          <text class="text-[15px] text-zinc-900 mb-1.5">Name: Angular</text>

          @if (showDetails()) {
            <block>
              <text class="text-[15px] text-zinc-900 mb-1.5"
                >Type: Framework</text
              >
              <text class="text-[15px] text-zinc-900 mb-1.5"
                >Language: TypeScript</text
              >
            </block>
          }
        </view>
      </view>
    </scroll-view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  readonly showDetails = signal(false);

  toggle(): void {
    this.showDetails.update((v) => !v);
  }
}

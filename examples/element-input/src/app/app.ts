import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="h-full bg-zinc-50" scroll-orientation="vertical">
      <view class="p-6">
        <text class="text-[28px] font-bold text-zinc-900 mb-1"
          >Input Element</text
        >
        <text class="text-[13px] text-zinc-500 mb-5"
          >Text input with reactive signal binding.</text
        >

        <view class="bg-white border border-zinc-200 rounded-xl p-4 mb-4">
          <text
            class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-2.5"
            >Try it</text
          >
          <input
            type="text"
            class="px-3.5 py-3 text-[15px] bg-white border border-zinc-200 rounded-lg"
            placeholder="Type your name..."
            (bindinput)="onInput($event)"
          />
        </view>

        <view
          class="bg-indigo-50 border border-indigo-200 rounded-xl p-4 items-center"
        >
          <text class="text-[18px] font-semibold text-indigo-700"
            >Hello, {{ name() || 'stranger' }}!</text
          >
        </view>
      </view>
    </scroll-view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  readonly name = signal('');

  onInput(event: Event): void {
    this.name.set((event as CustomEvent<{ value: string }>).detail.value);
  }
}

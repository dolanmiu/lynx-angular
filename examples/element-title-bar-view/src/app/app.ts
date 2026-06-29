import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="h-full bg-zinc-50" scroll-orientation="vertical">
      <view class="p-6">
        <text class="text-[28px] font-bold text-zinc-900 mb-1"
          >Title Bar View</text
        >
        <text class="text-[13px] text-zinc-500 mb-5"
          >A custom frameless window title bar with draggable regions.</text
        >

        <view class="bg-white border border-zinc-200 rounded-xl p-4 mb-4">
          <text
            class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-2.5"
            >Title Bar</text
          >
          <view
            class="h-[44px] flex-row items-center bg-zinc-100 rounded-lg overflow-hidden"
          >
            <title-bar-view
              moveable="true"
              class="flex-1 h-full justify-center"
            >
              <text class="text-sm font-semibold text-zinc-900 pl-3.5"
                >My App</text
              >
            </title-bar-view>
            <view
              class="w-11 h-full items-center justify-center border-l border-zinc-200"
              (bindtap)="close()"
            >
              <text class="text-sm text-zinc-500">✕</text>
            </view>
          </view>
        </view>

        <view class="bg-zinc-100 rounded-xl p-3.5">
          <text class="text-[13px] text-zinc-500">{{ message() }}</text>
        </view>
      </view>
    </scroll-view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  readonly message = signal('Drag the title bar to move the window.');

  close(): void {
    this.message.set('Close button tapped!');
  }
}

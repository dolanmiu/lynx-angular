import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="h-full bg-zinc-50" scroll-orientation="vertical">
      <view class="p-6">
        <text class="text-[28px] font-bold text-zinc-900 mb-1"
          >Overlay Element</text
        >
        <text class="text-[13px] text-zinc-500 mb-5"
          >A floating layer for modals and popups.</text
        >

        <view
          class="bg-indigo-500 py-3 px-6 rounded-[10px] items-center"
          (bindtap)="open()"
        >
          <text class="text-white text-[15px] font-semibold">Show Modal</text>
        </view>

        <overlay [attr.visible]="showModal()">
          <view
            class="absolute top-0 left-0 right-0 bottom-0 items-center justify-center"
            style="background-color: rgba(0,0,0,0.4)"
            (bindtap)="close()"
          >
            <view
              class="bg-white border border-zinc-200 p-6 rounded-2xl w-[260px] items-center"
              (catchtap)="noop()"
            >
              <text class="text-[18px] font-bold text-zinc-900 mb-2"
                >Modal Title</text
              >
              <text class="text-sm text-zinc-500 mb-5 text-center leading-5"
                >This overlay floats above the normal content.</text
              >
              <view
                class="bg-indigo-500 py-3 px-6 rounded-[10px] items-center"
                (bindtap)="close()"
              >
                <text class="text-white text-[15px] font-semibold">Close</text>
              </view>
            </view>
          </view>
        </overlay>
      </view>
    </scroll-view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  readonly showModal = signal(false);

  open(): void {
    this.showModal.set(true);
  }

  close(): void {
    this.showModal.set(false);
  }

  /**
   * Catches tap to prevent it from reaching the backdrop
   */
  noop(): void {}
}

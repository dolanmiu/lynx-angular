import { Component, computed, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="h-full bg-zinc-50" scroll-orientation="vertical">
      <view class="p-6">
        <text class="text-[28px] font-bold text-zinc-900 mb-1"
          >Textarea Element</text
        >
        <text class="text-[13px] text-zinc-500 mb-5"
          >Multi-line input with a reactive character counter.</text
        >

        <view class="bg-white border border-zinc-200 rounded-xl p-4">
          <text
            class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-2.5"
            >Compose</text
          >
          <textarea
            class="px-3.5 py-3 text-[15px] border border-zinc-200 rounded-lg h-[120px] bg-white"
            placeholder="Write a message..."
            (bindinput)="onInput($event)"
          ></textarea>
          <text class="text-xs text-zinc-400 text-right mt-1.5"
            >{{ charCount() }} characters</text
          >
        </view>
      </view>
    </scroll-view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  readonly text = signal('');
  readonly charCount = computed(() => this.text().length);

  onInput(event: { detail: { value: string } }): void {
    this.text.set(event.detail.value);
  }
}

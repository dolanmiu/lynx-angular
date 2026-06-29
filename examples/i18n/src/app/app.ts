import { Component, inject, signal } from '@angular/core';
import { LYNX_ELEMENTS, LynxLocale } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="h-full bg-zinc-50" scroll-orientation="vertical">
      <view class="p-6">
        <text class="text-[28px] font-bold text-zinc-900 mb-1">i18n</text>
        <text class="text-[13px] text-zinc-500 mb-5"
          >Internationalization with Angular and Lynx.</text
        >

        <view class="bg-indigo-50 py-2.5 px-3.5 rounded-lg mb-4">
          <text class="text-[13px] font-semibold text-indigo-700"
            >Locale: {{ localeService.locale() }}</text
          >
        </view>

        <view class="bg-white border border-zinc-200 rounded-xl p-4 mb-4">
          <text
            class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-2.5"
            >Translated Strings</text
          >
          <text i18n="@@app.greeting" class="text-[18px] text-zinc-900 mb-2">
            Hello, world!
          </text>
          <text class="text-[15px] text-zinc-900 mb-2">{{
            welcomeMessage
          }}</text>
          <text
            i18n="
              app description|A brief description of the i18n
              example@@app.description"
            class="text-[13px] text-zinc-500"
          >
            This is an internationalization example with Angular on Lynx.
          </text>
        </view>

        <view class="bg-white border border-zinc-200 rounded-xl p-4 mb-4">
          <text
            class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-2.5"
            >Counter</text
          >
          <text class="text-[18px] text-zinc-900 mb-3">{{
            counterMessage()
          }}</text>
          <view
            class="bg-indigo-500 py-3 px-6 rounded-[10px] items-center"
            (bindtap)="increment()"
          >
            <text
              i18n="@@app.tap_button"
              class="text-white text-[15px] font-semibold"
              >Tap to increment</text
            >
          </view>
        </view>
      </view>
    </scroll-view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  readonly localeService = inject(LynxLocale);
  readonly count = signal(0);
  readonly userName = 'Angular Developer';

  get welcomeMessage(): string {
    return $localize`:@@app.welcome:Welcome, ${this.userName}:userName:!`;
  }

  counterMessage() {
    const count = this.count();
    return $localize`:@@app.counter:Counter: ${count}:count:`;
  }

  increment(): void {
    this.count.update((n) => n + 1);
  }
}

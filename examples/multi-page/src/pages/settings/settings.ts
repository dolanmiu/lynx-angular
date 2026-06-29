import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-settings',
  template: `
    <scroll-view class="h-full bg-zinc-50" scroll-orientation="vertical">
      <view class="p-6">
        <text class="text-[28px] font-bold text-zinc-900 mb-1"
          >Settings Page</text
        >
        <text class="text-[13px] text-zinc-500 mb-5"
          >A separate Lynx page with its own entry point.</text
        >

        <view class="bg-white border border-zinc-200 rounded-xl p-4">
          <view class="flex-row items-center justify-between py-1">
            <text class="text-[15px] text-zinc-900">Dark Mode</text>
            <view
              class="w-12 h-7 rounded-[14px] p-0.5"
              [style.background-color]="darkMode() ? '#22c55e' : '#d4d4d8'"
              (bindtap)="toggleDarkMode()"
            >
              <view
                class="w-6 h-6 rounded-xl bg-white"
                [style.margin-left]="darkMode() ? '20px' : '0px'"
              />
            </view>
          </view>

          <view class="h-px bg-zinc-200 my-3" />

          <view class="flex-row items-center justify-between py-1">
            <text class="text-[15px] text-zinc-900">Notifications</text>
            <view
              class="w-12 h-7 rounded-[14px] p-0.5"
              [style.background-color]="notifications() ? '#22c55e' : '#d4d4d8'"
              (bindtap)="toggleNotifications()"
            >
              <view
                class="w-6 h-6 rounded-xl bg-white"
                [style.margin-left]="notifications() ? '20px' : '0px'"
              />
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class Settings {
  readonly darkMode = signal(false);
  readonly notifications = signal(true);

  toggleDarkMode(): void {
    this.darkMode.update((v) => !v);
  }

  toggleNotifications(): void {
    this.notifications.update((v) => !v);
  }
}

import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-settings',
  template: `
    <view style="padding: 24px;">
      <text style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">
        Settings Page
      </text>
      <view style="margin-bottom: 12px;">
        <text style="font-size: 16px; margin-bottom: 4px;">Dark Mode</text>
        <view
          style="
            background-color: {{ darkMode() ? '#4caf50' : '#ccc' }};
            width: 48px;
            height: 28px;
            border-radius: 14px;
            padding: 2px;
          "
          (bindtap)="toggleDarkMode()"
        >
          <view
            style="
              width: 24px;
              height: 24px;
              border-radius: 12px;
              background-color: white;
              margin-left: {{ darkMode() ? '20px' : '0px' }};
            "
          />
        </view>
      </view>
      <view style="margin-bottom: 12px;">
        <text style="font-size: 16px; margin-bottom: 4px;">Notifications</text>
        <view
          style="
            background-color: {{ notifications() ? '#4caf50' : '#ccc' }};
            width: 48px;
            height: 28px;
            border-radius: 14px;
            padding: 2px;
          "
          (bindtap)="toggleNotifications()"
        >
          <view
            style="
              width: 24px;
              height: 24px;
              border-radius: 12px;
              background-color: white;
              margin-left: {{ notifications() ? '20px' : '0px' }};
            "
          />
        </view>
      </view>
    </view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class Settings {
  darkMode = signal(false);
  notifications = signal(true);

  toggleDarkMode(): void {
    this.darkMode.update((v) => !v);
  }

  toggleNotifications(): void {
    this.notifications.update((v) => !v);
  }
}

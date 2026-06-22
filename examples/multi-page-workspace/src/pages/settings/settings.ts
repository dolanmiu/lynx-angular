import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-settings',
  template: `
    <scroll-view class="page" scroll-orientation="vertical">
      <view class="container">
        <text class="title">Settings Page</text>
        <text class="subtitle">
          This page is the "settings" project in angular.json.
        </text>

        <view class="card">
          <view class="setting-row">
            <text class="setting-label">Dark Mode</text>
            <view
              class="toggle"
              [style.background-color]="darkMode() ? '#22c55e' : '#d4d4d8'"
              (bindtap)="toggleDarkMode()"
            >
              <view
                class="toggle-knob"
                [style.margin-left]="darkMode() ? '20px' : '0px'"
              />
            </view>
          </view>

          <view class="divider" />

          <view class="setting-row">
            <text class="setting-label">Notifications</text>
            <view
              class="toggle"
              [style.background-color]="notifications() ? '#22c55e' : '#d4d4d8'"
              (bindtap)="toggleNotifications()"
            >
              <view
                class="toggle-knob"
                [style.margin-left]="notifications() ? '20px' : '0px'"
              />
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  `,
  styles: `
    .page {
      height: 100%;
      background-color: #fafafa;
    }
    .container {
      padding: 24px;
    }
    .title {
      font-size: 28px;
      font-weight: bold;
      color: #18181b;
      margin-bottom: 4px;
    }
    .subtitle {
      font-size: 13px;
      color: #71717a;
      margin-bottom: 20px;
    }
    .card {
      background-color: #ffffff;
      border: 1px solid #e4e4e7;
      border-radius: 12px;
      padding: 16px;
    }
    .setting-row {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: 4px 0;
    }
    .setting-label {
      font-size: 15px;
      color: #18181b;
    }
    .divider {
      height: 1px;
      background-color: #e4e4e7;
      margin: 12px 0;
    }
    .toggle {
      width: 48px;
      height: 28px;
      border-radius: 14px;
      padding: 2px;
    }
    .toggle-knob {
      width: 24px;
      height: 24px;
      border-radius: 12px;
      background-color: white;
    }
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

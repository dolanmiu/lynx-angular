import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { UiSwitch, UiLabel } from '@blotch/ui';

@Component({
  selector: 'app-root',
  imports: [LYNX_ELEMENTS, UiSwitch, UiLabel],
  template: `
    <view class="flex flex-col gap-6 p-6">
      <text class="text-2xl font-bold text-foreground">Switch</text>
      <text class="text-sm text-muted-foreground">
        A toggle switch for turning options on or off.
      </text>

      <!-- Switch on -->
      <view class="flex flex-row items-center justify-between">
        <ui-label>Wi-Fi</ui-label>
        <ui-switch [(checked)]="wifi" />
      </view>

      <!-- Switch off -->
      <view class="flex flex-row items-center justify-between">
        <ui-label>Bluetooth</ui-label>
        <ui-switch [(checked)]="bluetooth" />
      </view>

      <!-- Switch with description -->
      <view class="flex flex-row items-center justify-between">
        <view class="flex flex-col gap-1">
          <ui-label>Dark Mode</ui-label>
          <text class="text-xs text-muted-foreground">
            Use dark color theme
          </text>
        </view>
        <ui-switch [(checked)]="darkMode" />
      </view>

      <!-- Disabled switch (off) -->
      <view class="flex flex-row items-center justify-between">
        <ui-label [disabled]="true">Airplane Mode</ui-label>
        <ui-switch [disabled]="true" />
      </view>

      <!-- Disabled switch (on) -->
      <view class="flex flex-row items-center justify-between">
        <ui-label [disabled]="true">Notifications (locked)</ui-label>
        <ui-switch [disabled]="true" [checked]="true" />
      </view>

      <!-- Display current state -->
      <view class="rounded-md border border-border bg-muted p-4">
        <text class="text-sm font-medium text-foreground mb-2">State</text>
        <text class="text-xs text-muted-foreground">
          Wi-Fi: {{ wifi() }}
        </text>
        <text class="text-xs text-muted-foreground">
          Bluetooth: {{ bluetooth() }}
        </text>
        <text class="text-xs text-muted-foreground">
          Dark Mode: {{ darkMode() }}
        </text>
      </view>
    </view>
  `,
})
export class App {
  wifi = signal(true);
  bluetooth = signal(false);
  darkMode = signal(false);
}

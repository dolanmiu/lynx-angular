import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { UiSwitch } from '@blotch/ui/components/switch';
import { UiLabel } from '@blotch/ui/components/label';
import { UiSeparator } from '@blotch/ui/components/separator';
import { UiSelect, UiSelectItem } from '@blotch/ui/components/select';
import { UiRadioGroup, UiRadioGroupItem } from '@blotch/ui/components/radio-group';
import {
  UiAlertDialog,
  UiAlertDialogHeader,
  UiAlertDialogTitle,
  UiAlertDialogDescription,
  UiAlertDialogFooter,
} from '@blotch/ui/components/alert-dialog';
import { UiButton } from '@blotch/ui/components/button';

@Component({
  selector: 'app-root',
  imports: [
    LYNX_ELEMENTS,
    UiSwitch, UiLabel, UiSeparator,
    UiSelect, UiSelectItem,
    UiRadioGroup, UiRadioGroupItem,
    UiAlertDialog, UiAlertDialogHeader, UiAlertDialogTitle,
    UiAlertDialogDescription, UiAlertDialogFooter,
    UiButton,
  ],
  template: `
    <scroll-view scroll-orientation="vertical" class="h-full">
      <view class="flex flex-col gap-6 p-6">
        <text class="text-2xl font-bold text-foreground">Settings</text>

        <view class="flex flex-col gap-3">
          <text class="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Notifications</text>
          <view class="flex flex-row items-center justify-between">
            <view class="flex flex-col gap-0.5">
              <ui-label>Push Notifications</ui-label>
              <text class="text-xs text-muted-foreground">Receive alerts on your device</text>
            </view>
            <ui-switch [(checked)]="pushNotifications" />
          </view>
          <view class="flex flex-row items-center justify-between">
            <ui-label>Sound</ui-label>
            <ui-switch [(checked)]="sound" />
          </view>
          <view class="flex flex-row items-center justify-between">
            <ui-label>Email Digest</ui-label>
            <ui-switch [(checked)]="emailDigest" />
          </view>
        </view>

        <ui-separator />

        <view class="flex flex-col gap-3">
          <text class="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Appearance</text>
          <view class="flex flex-col gap-1">
            <ui-label>Language</ui-label>
            <ui-select [(value)]="language">
              <ui-select-item value="en">English</ui-select-item>
              <ui-select-item value="es">Español</ui-select-item>
              <ui-select-item value="fr">Français</ui-select-item>
              <ui-select-item value="de">Deutsch</ui-select-item>
            </ui-select>
          </view>
          <view class="flex flex-col gap-2">
            <ui-label>Theme</ui-label>
            <ui-radio-group [(value)]="theme">
              <view class="flex flex-col gap-2">
                @for (opt of themeOptions; track opt.value) {
                  <view class="flex flex-row items-center gap-2">
                    <ui-radio-group-item [value]="opt.value" [id]="opt.value" />
                    <ui-label [for]="opt.value">{{ opt.label }}</ui-label>
                  </view>
                }
              </view>
            </ui-radio-group>
          </view>
        </view>

        <ui-separator />

        <view class="flex flex-col gap-3">
          <text class="text-xs font-semibold uppercase tracking-widest text-destructive">Danger Zone</text>
          <ui-button variant="destructive" (tap)="deleteDialogOpen.set(true)">Delete Account</ui-button>
        </view>
      </view>
    </scroll-view>

    <ui-alert-dialog [(open)]="deleteDialogOpen">
      <ui-alert-dialog-header>
        <ui-alert-dialog-title>Delete Account</ui-alert-dialog-title>
        <ui-alert-dialog-description>
          This will permanently delete your account and all data. This action cannot be undone.
        </ui-alert-dialog-description>
      </ui-alert-dialog-header>
      <ui-alert-dialog-footer>
        <ui-button variant="outline" (tap)="deleteDialogOpen.set(false)">Cancel</ui-button>
        <ui-button variant="destructive" (tap)="deleteDialogOpen.set(false)">Delete</ui-button>
      </ui-alert-dialog-footer>
    </ui-alert-dialog>
  `,
})
export class App {
  readonly pushNotifications = signal(true);
  readonly sound = signal(true);
  readonly emailDigest = signal(false);
  readonly language = signal('en');
  readonly theme = signal('system');
  readonly deleteDialogOpen = signal(false);

  readonly themeOptions = [
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ];
}

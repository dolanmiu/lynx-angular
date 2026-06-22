// cspell:words Español Français Deutsch
import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { UiSwitch } from '../components/ui/switch';
import { UiLabel } from '../components/ui/label';
import { UiSeparator } from '../components/ui/separator';
import { UiSelect, UiSelectItem } from '../components/ui/select';
import { UiRadioGroup, UiRadioGroupItem } from '../components/ui/radio-group';
import {
  UiAlertDialog,
  UiAlertDialogHeader,
  UiAlertDialogTitle,
  UiAlertDialogDescription,
  UiAlertDialogFooter,
} from '../components/ui/alert-dialog';
import { UiButton } from '../components/ui/button';

@Component({
  selector: 'app-root',
  imports: [
    LYNX_ELEMENTS,
    UiSwitch,
    UiLabel,
    UiSeparator,
    UiSelect,
    UiSelectItem,
    UiRadioGroup,
    UiRadioGroupItem,
    UiAlertDialog,
    UiAlertDialogHeader,
    UiAlertDialogTitle,
    UiAlertDialogDescription,
    UiAlertDialogFooter,
    UiButton,
  ],
  template: `
    <scroll-view scroll-orientation="vertical" class="page">
      <view class="container">
        <text class="title">Settings</text>

        <view class="section">
          <text class="section-header">Notifications</text>
          <view class="setting-row">
            <view class="setting-info">
              <ui-label>Push Notifications</ui-label>
              <text class="setting-desc">Receive alerts on your device</text>
            </view>
            <ui-switch [(checked)]="pushNotifications" />
          </view>
          <view class="setting-row">
            <ui-label>Sound</ui-label>
            <ui-switch [(checked)]="sound" />
          </view>
          <view class="setting-row">
            <ui-label>Email Digest</ui-label>
            <ui-switch [(checked)]="emailDigest" />
          </view>
        </view>

        <ui-separator />

        <view class="section">
          <text class="section-header">Appearance</text>
          <view class="field">
            <ui-label>Language</ui-label>
            <ui-select [(value)]="language">
              <ui-select-item value="en" label="English" />
              <ui-select-item value="es" label="Español" />
              <ui-select-item value="fr" label="Français" />
              <ui-select-item value="de" label="Deutsch" />
            </ui-select>
          </view>
          <view class="field-lg">
            <ui-label>Theme</ui-label>
            <ui-radio-group [(value)]="theme">
              <view class="radio-list">
                @for (opt of themeOptions; track opt.value) {
                  <view class="radio-row">
                    <ui-radio-group-item [value]="opt.value" [id]="opt.value" />
                    <ui-label [for]="opt.value">{{ opt.label }}</ui-label>
                  </view>
                }
              </view>
            </ui-radio-group>
          </view>
        </view>

        <ui-separator />

        <view class="section">
          <text class="section-header-danger">Danger Zone</text>
          <ui-button
            variant="destructive"
            (pressed)="deleteDialogOpen.set(true)"
            >Delete Account</ui-button
          >
        </view>
      </view>
    </scroll-view>

    <ui-alert-dialog [(open)]="deleteDialogOpen">
      <ui-alert-dialog-header>
        <ui-alert-dialog-title>Delete Account</ui-alert-dialog-title>
        <ui-alert-dialog-description>
          This will permanently delete your account and all data. This action
          cannot be undone.
        </ui-alert-dialog-description>
      </ui-alert-dialog-header>
      <ui-alert-dialog-footer>
        <ui-button variant="outline" (pressed)="deleteDialogOpen.set(false)"
          >Cancel</ui-button
        >
        <ui-button variant="destructive" (pressed)="deleteDialogOpen.set(false)"
          >Delete</ui-button
        >
      </ui-alert-dialog-footer>
    </ui-alert-dialog>
  `,
  styles: `
    .page {
      height: 100vh;
      background-color: #fafafa;
    }
    .container {
      display: flex;
      flex-direction: column;
      gap: 24px;
      padding: 24px;
    }
    .title {
      font-size: 28px;
      font-weight: bold;
      color: #18181b;
    }
    .section {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .section-header {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #a1a1aa;
    }
    .section-header-danger {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #ef4444;
    }
    .setting-row {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background-color: #ffffff;
      border: 1px solid #e4e4e7;
      border-radius: 12px;
    }
    .setting-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .setting-desc {
      font-size: 12px;
      color: #a1a1aa;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .field-lg {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .radio-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .radio-row {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background-color: #ffffff;
      border: 1px solid #e4e4e7;
      border-radius: 12px;
    }
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

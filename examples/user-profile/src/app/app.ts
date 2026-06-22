import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { UiAvatar } from '../components/ui/avatar';
import { UiBadge } from '../components/ui/badge';
import {
  UiCard,
  UiCardHeader,
  UiCardTitle,
  UiCardContent,
} from '../components/ui/card';
import { UiButton } from '../components/ui/button';
import {
  UiSheet,
  UiSheetHeader,
  UiSheetTitle,
  UiSheetFooter,
} from '../components/ui/sheet';
import { UiInput } from '../components/ui/input';
import { UiTextarea } from '../components/ui/textarea';
import { UiLabel } from '../components/ui/label';
import { UiSeparator } from '../components/ui/separator';

@Component({
  selector: 'app-root',
  imports: [
    LYNX_ELEMENTS,
    UiAvatar,
    UiBadge,
    UiCard,
    UiCardHeader,
    UiCardTitle,
    UiCardContent,
    UiButton,
    UiSheet,
    UiSheetHeader,
    UiSheetTitle,
    UiSheetFooter,
    UiInput,
    UiTextarea,
    UiLabel,
    UiSeparator,
  ],
  template: `
    <scroll-view scroll-orientation="vertical" class="page">
      <view class="container">
        <view class="profile-header">
          <ui-avatar size="xl" src="" fallback="AJ" />
          <text class="name">Alex Johnson</text>
          <view class="username-row">
            <!-- cspell:disable-next-line -->
            <text class="username">@alexj</text>
            <ui-badge variant="secondary">Pro</ui-badge>
          </view>
        </view>

        <view class="stats-row">
          <view class="stat">
            <text class="stat-value">248</text>
            <text class="stat-label">Posts</text>
          </view>
          <ui-separator orientation="vertical" />
          <view class="stat">
            <text class="stat-value">4.2k</text>
            <text class="stat-label">Followers</text>
          </view>
          <ui-separator orientation="vertical" />
          <view class="stat">
            <text class="stat-value">312</text>
            <text class="stat-label">Following</text>
          </view>
        </view>

        <ui-button class="w-full" (pressed)="editOpen.set(true)"
          >Edit Profile</ui-button
        >

        <ui-card class="w-full">
          <ui-card-header><ui-card-title>About</ui-card-title></ui-card-header>
          <ui-card-content>
            <text class="bio-text">{{ bio() }}</text>
          </ui-card-content>
        </ui-card>
      </view>
    </scroll-view>

    <ui-sheet [(open)]="editOpen">
      <ui-sheet-header
        ><ui-sheet-title>Edit Profile</ui-sheet-title></ui-sheet-header
      >
      <view class="sheet-form">
        <view class="field">
          <ui-label>Display Name</ui-label>
          <ui-input
            [value]="editName()"
            (valueChange)="editName.set($event)"
            placeholder="Your name"
          />
        </view>
        <view class="field">
          <ui-label>Bio</ui-label>
          <ui-textarea
            [value]="editBio()"
            (valueChange)="editBio.set($event)"
            placeholder="Tell us about yourself"
          />
        </view>
      </view>
      <ui-sheet-footer>
        <ui-button variant="outline" (pressed)="editOpen.set(false)"
          >Cancel</ui-button
        >
        <ui-button (pressed)="saveEdit()">Save</ui-button>
      </ui-sheet-footer>
    </ui-sheet>
  `,
  styles: `
    .page {
      height: 100vh;
      background-color: #fafafa;
    }
    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      padding: 32px 24px;
    }
    .profile-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .name {
      font-size: 24px;
      font-weight: bold;
      color: #18181b;
    }
    .username-row {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 8px;
    }
    .username {
      font-size: 14px;
      color: #71717a;
    }
    .stats-row {
      display: flex;
      flex-direction: row;
      gap: 28px;
      padding: 20px 24px;
      background-color: #ffffff;
      border: 1px solid #e4e4e7;
      border-radius: 16px;
    }
    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }
    .stat-value {
      font-size: 20px;
      font-weight: bold;
      color: #18181b;
    }
    .stat-label {
      font-size: 12px;
      color: #a1a1aa;
    }
    .bio-text {
      font-size: 14px;
      color: #71717a;
      line-height: 20px;
    }
    .sheet-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
  `,
})
export class App {
  readonly editOpen = signal(false);
  readonly bio = signal(
    'Full-stack developer passionate about mobile UX and cross-platform apps. Building cool things with AngularLynx.',
  );
  readonly editName = signal('Alex Johnson');
  readonly editBio = signal(this.bio());

  saveEdit(): void {
    this.bio.set(this.editBio());
    this.editOpen.set(false);
  }
}

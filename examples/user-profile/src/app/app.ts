import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { UiAvatar } from '@blotch/ui/components/avatar';
import { UiBadge } from '@blotch/ui/components/badge';
import { UiCard, UiCardHeader, UiCardTitle, UiCardContent } from '@blotch/ui/components/card';
import { UiButton } from '@blotch/ui/components/button';
import { UiSheet, UiSheetHeader, UiSheetTitle, UiSheetFooter } from '@blotch/ui/components/sheet';
import { UiInput } from '@blotch/ui/components/input';
import { UiTextarea } from '@blotch/ui/components/textarea';
import { UiLabel } from '@blotch/ui/components/label';
import { UiSeparator } from '@blotch/ui/components/separator';

@Component({
  selector: 'app-root',
  imports: [
    LYNX_ELEMENTS,
    UiAvatar, UiBadge,
    UiCard, UiCardHeader, UiCardTitle, UiCardContent,
    UiButton,
    UiSheet, UiSheetHeader, UiSheetTitle, UiSheetFooter,
    UiInput, UiTextarea, UiLabel, UiSeparator,
  ],
  template: `
    <scroll-view scroll-orientation="vertical" class="h-full">
      <view class="flex flex-col items-center gap-4 p-6">
        <view class="flex flex-col items-center gap-2">
          <ui-avatar size="xl" src="" fallback="AJ" />
          <text class="text-2xl font-bold text-foreground">Alex Johnson</text>
          <view class="flex flex-row items-center gap-2">
            <text class="text-sm text-muted-foreground">@alexj</text>
            <ui-badge variant="secondary">Pro</ui-badge>
          </view>
        </view>

        <view class="flex flex-row gap-6">
          <view class="flex flex-col items-center gap-0.5">
            <text class="text-lg font-bold text-foreground">248</text>
            <text class="text-xs text-muted-foreground">Posts</text>
          </view>
          <ui-separator orientation="vertical" />
          <view class="flex flex-col items-center gap-0.5">
            <text class="text-lg font-bold text-foreground">4.2k</text>
            <text class="text-xs text-muted-foreground">Followers</text>
          </view>
          <ui-separator orientation="vertical" />
          <view class="flex flex-col items-center gap-0.5">
            <text class="text-lg font-bold text-foreground">312</text>
            <text class="text-xs text-muted-foreground">Following</text>
          </view>
        </view>

        <ui-button class="w-full" (tap)="editOpen.set(true)">Edit Profile</ui-button>

        <ui-card class="w-full">
          <ui-card-header><ui-card-title>About</ui-card-title></ui-card-header>
          <ui-card-content>
            <text class="text-sm text-muted-foreground">{{ bio() }}</text>
          </ui-card-content>
        </ui-card>
      </view>
    </scroll-view>

    <ui-sheet [(open)]="editOpen">
      <ui-sheet-header><ui-sheet-title>Edit Profile</ui-sheet-title></ui-sheet-header>
      <view class="flex flex-col gap-4 p-4">
        <view class="flex flex-col gap-1.5">
          <ui-label>Display Name</ui-label>
          <ui-input [value]="editName()" (valueChange)="editName.set($event)" placeholder="Your name" />
        </view>
        <view class="flex flex-col gap-1.5">
          <ui-label>Bio</ui-label>
          <ui-textarea [value]="editBio()" (valueChange)="editBio.set($event)" placeholder="Tell us about yourself" />
        </view>
      </view>
      <ui-sheet-footer>
        <ui-button variant="outline" (tap)="editOpen.set(false)">Cancel</ui-button>
        <ui-button (tap)="saveEdit()">Save</ui-button>
      </ui-sheet-footer>
    </ui-sheet>
  `,
})
export class App {
  readonly editOpen = signal(false);
  readonly bio = signal('Full-stack developer passionate about mobile UX and cross-platform apps. Building cool things with AngularLynx.');
  readonly editName = signal('Alex Johnson');
  readonly editBio = signal(this.bio());

  saveEdit(): void {
    this.bio.set(this.editBio());
    this.editOpen.set(false);
  }
}

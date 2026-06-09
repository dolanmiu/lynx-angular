import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import {
  UiActionSheet,
  UiActionSheetTitle,
  UiActionSheetItem,
  UiActionSheetCancel,
  UiButton,
} from '@blotch/ui';

@Component({
  selector: 'app-root',
  imports: [
    LYNX_ELEMENTS,
    UiActionSheet,
    UiActionSheetTitle,
    UiActionSheetItem,
    UiActionSheetCancel,
    UiButton,
  ],
  template: `
    <view class="flex flex-col gap-4 p-6">
      <text class="text-2xl font-bold text-foreground">Action Sheet</text>

      <ui-button (pressed)="showSheet.set(true)">Share Document</ui-button>

      <ui-action-sheet [(open)]="showSheet">
        <ui-action-sheet-title>Share this document</ui-action-sheet-title>
        <ui-action-sheet-item (pressed)="onShare('copy')">
          Copy Link
        </ui-action-sheet-item>
        <ui-action-sheet-item (pressed)="onShare('email')">
          Send via Email
        </ui-action-sheet-item>
        <ui-action-sheet-item
          variant="destructive"
          (pressed)="onShare('delete')"
        >
          Delete Document
        </ui-action-sheet-item>
        <ui-action-sheet-cancel />
      </ui-action-sheet>
    </view>
  `,
})
export class App {
  showSheet = signal(false);

  onShare(_action: string): void {
    // Handle the selected action
  }
}

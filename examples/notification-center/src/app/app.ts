import { Component, computed, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { UiBadge } from '@blotch/ui/components/badge';
import { UiCard, UiCardContent } from '@blotch/ui/components/card';
import { UiToaster, toast } from '@blotch/ui/components/toast';
import {
  UiActionSheet,
  UiActionSheetTitle,
  UiActionSheetItem,
  UiActionSheetCancel,
} from '@blotch/ui/components/action-sheet';
import { UiEmptyState } from '@blotch/ui/components/empty-state';
import { UiButton } from '@blotch/ui/components/button';

interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  time: string;
}

@Component({
  selector: 'app-root',
  imports: [
    LYNX_ELEMENTS,
    UiBadge, UiCard, UiCardContent, UiToaster,
    UiActionSheet, UiActionSheetTitle, UiActionSheetItem, UiActionSheetCancel,
    UiEmptyState, UiButton,
  ],
  template: `
    <view class="flex flex-col h-full">
      <view class="flex flex-row items-center justify-between p-4 border-b border-border">
        <view class="flex flex-row items-center gap-2">
          <text class="text-xl font-bold text-foreground">Notifications</text>
          @if (unreadCount() > 0) {
            <ui-badge>{{ unreadCount() }}</ui-badge>
          }
        </view>
        @if (notifications().length > 0) {
          <ui-button variant="ghost" size="sm" (tap)="clearAll()">Clear All</ui-button>
        }
      </view>

      <scroll-view scroll-orientation="vertical" class="flex-1">
        @if (notifications().length === 0) {
          <view class="p-6">
            <ui-empty-state icon="bell" title="All caught up" description="No notifications to show." />
          </view>
        } @else {
          <view class="flex flex-col gap-2 p-4">
            @for (n of notifications(); track n.id) {
              <ui-card [class.opacity-60]="n.read" (longpress)="openActionSheet(n)">
                <ui-card-content class="p-3">
                  <view class="flex flex-row items-start gap-3">
                    @if (!n.read) {
                      <view class="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    } @else {
                      <view class="w-2 h-2 mt-1.5 shrink-0" />
                    }
                    <view class="flex flex-col gap-0.5 flex-1">
                      <text class="text-sm font-semibold text-foreground">{{ n.title }}</text>
                      <text class="text-xs text-muted-foreground">{{ n.message }}</text>
                      <text class="text-xs text-muted-foreground mt-1">{{ n.time }}</text>
                    </view>
                  </view>
                </ui-card-content>
              </ui-card>
            }
          </view>
        }
      </scroll-view>
    </view>

    @if (selected()) {
      <ui-action-sheet [(open)]="actionSheetOpen">
        <ui-action-sheet-title>{{ selected()!.title }}</ui-action-sheet-title>
        @if (!selected()!.read) {
          <ui-action-sheet-item (tap)="markRead()">Mark as Read</ui-action-sheet-item>
        }
        <ui-action-sheet-item variant="destructive" (tap)="deleteSelected()">Delete</ui-action-sheet-item>
        <ui-action-sheet-cancel>Cancel</ui-action-sheet-cancel>
      </ui-action-sheet>
    }

    <ui-toaster />
  `,
})
export class App {
  readonly notifications = signal<Notification[]>([
    { id: 1, title: 'New message', message: 'Jordan sent you a message.', read: false, time: '2m ago' },
    { id: 2, title: 'Build complete', message: 'Your app compiled successfully.', read: false, time: '15m ago' },
    { id: 3, title: 'Welcome!', message: 'Thanks for joining AngularLynx.', read: true, time: '1h ago' },
  ]);
  readonly unreadCount = computed(() => this.notifications().filter((n) => !n.read).length);
  readonly actionSheetOpen = signal(false);
  readonly selected = signal<Notification | null>(null);

  openActionSheet(n: Notification): void {
    this.selected.set(n);
    this.actionSheetOpen.set(true);
  }

  markRead(): void {
    const id = this.selected()!.id;
    this.notifications.update((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
    this.actionSheetOpen.set(false);
    toast('Marked as read');
  }

  deleteSelected(): void {
    const id = this.selected()!.id;
    this.notifications.update((list) => list.filter((n) => n.id !== id));
    this.actionSheetOpen.set(false);
    toast('Notification deleted');
  }

  clearAll(): void {
    this.notifications.set([]);
    toast('All notifications cleared');
  }
}

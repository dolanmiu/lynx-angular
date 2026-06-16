import { Component, computed, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { UiBadge } from '../components/ui/badge';
import { UiCard, UiCardContent } from '../components/ui/card';
import { UiToaster, toast } from '../components/ui/toast';
import {
  UiActionSheet,
  UiActionSheetTitle,
  UiActionSheetItem,
  UiActionSheetCancel,
} from '../components/ui/action-sheet';
import { UiEmptyState } from '../components/ui/empty-state';
import { UiButton } from '../components/ui/button';

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
    <view class="page">
      <view class="header">
        <view class="header-left">
          <text class="title">Notifications</text>
          @if (unreadCount() > 0) {
            <ui-badge>{{ unreadCount() }}</ui-badge>
          }
        </view>
        @if (notifications().length > 0) {
          <ui-button variant="ghost" size="sm" (pressed)="clearAll()">Clear All</ui-button>
        }
      </view>

      <scroll-view scroll-orientation="vertical" class="list">
        @if (notifications().length === 0) {
          <view class="empty-container">
            <ui-empty-state icon="bell" title="All caught up" description="No notifications to show." />
          </view>
        } @else {
          <view class="notification-list">
            @for (n of notifications(); track n.id) {
              <ui-card [class.notification-read]="n.read" (longpress)="openActionSheet(n)">
                <ui-card-content class="p-3">
                  <view class="notification-row">
                    @if (!n.read) {
                      <view class="unread-dot" />
                    } @else {
                      <view class="dot-spacer" />
                    }
                    <view class="notification-content">
                      <text class="notification-title">{{ n.title }}</text>
                      <text class="notification-message">{{ n.message }}</text>
                      <text class="notification-time">{{ n.time }}</text>
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
          <ui-action-sheet-item (pressed)="markRead()">Mark as Read</ui-action-sheet-item>
        }
        <ui-action-sheet-item variant="destructive" (pressed)="deleteSelected()">Delete</ui-action-sheet-item>
        <ui-action-sheet-cancel>Cancel</ui-action-sheet-cancel>
      </ui-action-sheet>
    }

    <ui-toaster />
  `,
  styles: `
    .page { display: flex; flex-direction: column; height: 100vh; background-color: #fafafa; }
    .header { display: flex; flex-direction: row; align-items: center; justify-content: space-between; padding: 16px 20px; background-color: #ffffff; border-bottom: 1px solid #e4e4e7; }
    .header-left { display: flex; flex-direction: row; align-items: center; gap: 10px; }
    .title { font-size: 22px; font-weight: bold; color: #18181b; }
    .list { flex: 1; }
    .empty-container { padding: 24px; }
    .notification-list { display: flex; flex-direction: column; gap: 8px; padding: 16px; }
    .notification-read { opacity: 0.55; }
    .notification-row { display: flex; flex-direction: row; align-items: flex-start; gap: 12px; }
    .unread-dot { width: 8px; height: 8px; border-radius: 50%; background-color: #6366f1; margin-top: 6px; flex-shrink: 0; }
    .dot-spacer { width: 8px; height: 8px; margin-top: 6px; flex-shrink: 0; }
    .notification-content { display: flex; flex-direction: column; gap: 2px; flex: 1; }
    .notification-title { font-size: 14px; font-weight: 600; color: #18181b; }
    .notification-message { font-size: 12px; color: #71717a; }
    .notification-time { font-size: 12px; color: #a1a1aa; margin-top: 4px; }
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
    toast({ title: 'Marked as read' });
  }

  deleteSelected(): void {
    const id = this.selected()!.id;
    this.notifications.update((list) => list.filter((n) => n.id !== id));
    this.actionSheetOpen.set(false);
    toast({ title: 'Notification deleted' });
  }

  clearAll(): void {
    this.notifications.set([]);
    toast({ title: 'All notifications cleared' });
  }
}

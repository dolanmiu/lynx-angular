import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import {
  UiNavDrawer,
  UiNavDrawerHeader,
  UiNavDrawerContent,
  UiNavDrawerItem,
  UiNavDrawerFooter,
  UiNavDrawerTrigger,
} from '../components/ui/nav-drawer';
import { UiIcon } from '../components/ui/icon';
import { UiSeparator } from '../components/ui/separator';

@Component({
  selector: 'app-root',
  imports: [
    LYNX_ELEMENTS,
    UiNavDrawer,
    UiNavDrawerHeader,
    UiNavDrawerContent,
    UiNavDrawerItem,
    UiNavDrawerFooter,
    UiNavDrawerTrigger,
    UiIcon,
    UiSeparator,
  ],
  template: `
    <view class="flex flex-col h-full">
      <view
        class="flex flex-row items-center px-4 py-3 border-b border-border bg-background"
      >
        <ui-nav-drawer-trigger (pressed)="drawerOpen.set(true)" />
        <text class="text-lg font-semibold text-foreground ml-3">My App</text>
      </view>

      <scroll-view scroll-orientation="vertical" class="flex-1">
        <view class="flex flex-col gap-4 p-6">
          <text class="text-2xl font-bold text-foreground">Nav Drawer</text>
          <text class="text-sm text-muted-foreground">
            Tap the hamburger menu icon to open the navigation drawer.
          </text>
          <text class="text-sm text-foreground">
            Current page: {{ currentPage() }}
          </text>
        </view>
      </scroll-view>

      <ui-nav-drawer [(open)]="drawerOpen">
        <ui-nav-drawer-header>
          <text class="text-lg font-semibold text-foreground">Navigation</text>
          <text class="text-sm text-muted-foreground">Choose a section</text>
        </ui-nav-drawer-header>
        <ui-nav-drawer-content>
          <ui-nav-drawer-item
            [active]="currentPage() === 'Home'"
            (pressed)="navigate('Home')"
          >
            <ui-icon name="heart" size="sm" />
            <text class="text-sm text-foreground">Home</text>
          </ui-nav-drawer-item>
          <ui-nav-drawer-item
            [active]="currentPage() === 'Search'"
            (pressed)="navigate('Search')"
          >
            <ui-icon name="search" size="sm" />
            <text class="text-sm text-foreground">Search</text>
          </ui-nav-drawer-item>
          <ui-nav-drawer-item
            [active]="currentPage() === 'Favorites'"
            (pressed)="navigate('Favorites')"
          >
            <ui-icon name="star" size="sm" />
            <text class="text-sm text-foreground">Favorites</text>
          </ui-nav-drawer-item>
          <ui-separator />
          <ui-nav-drawer-item
            [active]="currentPage() === 'Settings'"
            (pressed)="navigate('Settings')"
          >
            <ui-icon name="settings" size="sm" />
            <text class="text-sm text-foreground">Settings</text>
          </ui-nav-drawer-item>
        </ui-nav-drawer-content>
        <ui-nav-drawer-footer>
          <ui-nav-drawer-item variant="destructive" (pressed)="onLogout()">
            <ui-icon name="x" size="sm" color="hsl(var(--destructive))" />
            <text class="text-sm text-destructive">Log out</text>
          </ui-nav-drawer-item>
        </ui-nav-drawer-footer>
      </ui-nav-drawer>
    </view>
  `,
})
export class App {
  drawerOpen = signal(false);
  currentPage = signal('Home');

  navigate(page: string): void {
    this.currentPage.set(page);
  }

  onLogout(): void {
    this.currentPage.set('Logged out');
  }
}

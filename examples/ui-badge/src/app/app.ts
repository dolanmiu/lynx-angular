import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { UiBadge } from '@blotch/ui';

@Component({
  selector: 'app-root',
  imports: [LYNX_ELEMENTS, UiBadge],
  template: `
    <scroll-view scroll-orientation="vertical" class="h-full">
      <view class="p-6">
        <text class="text-2xl font-bold text-foreground mb-6">Badge</text>

        <!-- Variants -->
        <text class="text-sm font-medium text-muted-foreground mb-3">
          Variants
        </text>
        <view class="flex-row flex-wrap gap-2 mb-6">
          <ui-badge>Default</ui-badge>
          <ui-badge variant="secondary">Secondary</ui-badge>
          <ui-badge variant="destructive">Destructive</ui-badge>
          <ui-badge variant="outline">Outline</ui-badge>
        </view>

        <!-- Usage examples -->
        <text class="text-sm font-medium text-muted-foreground mb-3">
          Common Uses
        </text>
        <view class="gap-3">
          <view class="flex-row items-center gap-2">
            <text class="text-sm text-foreground">Status</text>
            <ui-badge>Active</ui-badge>
          </view>
          <view class="flex-row items-center gap-2">
            <text class="text-sm text-foreground">Notifications</text>
            <ui-badge variant="destructive">3</ui-badge>
          </view>
          <view class="flex-row items-center gap-2">
            <text class="text-sm text-foreground">Category</text>
            <ui-badge variant="secondary">Angular</ui-badge>
          </view>
          <view class="flex-row items-center gap-2">
            <text class="text-sm text-foreground">Version</text>
            <ui-badge variant="outline">v2.0</ui-badge>
          </view>
        </view>
      </view>
    </scroll-view>
  `,
})
export class App {}

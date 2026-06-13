import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { UiSpinner } from '@blotch/ui/components/spinner';

@Component({
  selector: 'app-root',
  imports: [LYNX_ELEMENTS, UiSpinner],
  template: `
    <scroll-view scroll-orientation="vertical" class="h-full">
      <view class="p-6">
        <text class="text-2xl font-bold text-foreground mb-6">Spinner</text>

        <!-- Sizes -->
        <text class="text-sm font-medium text-muted-foreground mb-3">Sizes</text>
        <view class="flex-row items-center gap-6 mb-6">
          <view class="items-center gap-2">
            <ui-spinner size="xs" />
            <text class="text-xs text-muted-foreground">xs</text>
          </view>
          <view class="items-center gap-2">
            <ui-spinner size="sm" />
            <text class="text-xs text-muted-foreground">sm</text>
          </view>
          <view class="items-center gap-2">
            <ui-spinner size="md" />
            <text class="text-xs text-muted-foreground">md</text>
          </view>
          <view class="items-center gap-2">
            <ui-spinner size="lg" />
            <text class="text-xs text-muted-foreground">lg</text>
          </view>
        </view>

        <!-- Custom colors -->
        <text class="text-sm font-medium text-muted-foreground mb-3">
          Custom Colors
        </text>
        <view class="flex-row items-center gap-6 mb-6">
          <view class="items-center gap-2">
            <ui-spinner color="#3b82f6" />
            <text class="text-xs text-muted-foreground">Blue</text>
          </view>
          <view class="items-center gap-2">
            <ui-spinner color="#ef4444" />
            <text class="text-xs text-muted-foreground">Red</text>
          </view>
          <view class="items-center gap-2">
            <ui-spinner color="#22c55e" />
            <text class="text-xs text-muted-foreground">Green</text>
          </view>
          <view class="items-center gap-2">
            <ui-spinner color="#f59e0b" />
            <text class="text-xs text-muted-foreground">Amber</text>
          </view>
        </view>

        <!-- In context -->
        <text class="text-sm font-medium text-muted-foreground mb-3">
          In Context
        </text>
        <view class="rounded-lg border border-border p-6 items-center gap-3">
          <ui-spinner size="lg" />
          <text class="text-sm text-muted-foreground">Loading content...</text>
        </view>
      </view>
    </scroll-view>
  `,
})
export class App {}

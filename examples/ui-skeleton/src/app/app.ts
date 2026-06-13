import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { UiSkeleton } from '@blotch/ui/components/skeleton';

@Component({
  selector: 'app-root',
  imports: [LYNX_ELEMENTS, UiSkeleton],
  template: `
    <scroll-view scroll-orientation="vertical" class="h-full">
      <view class="p-6">
        <text class="text-2xl font-bold text-foreground mb-6">Skeleton</text>

        <!-- Card skeleton -->
        <text class="text-sm font-medium text-muted-foreground mb-3">
          Card Loading State
        </text>
        <view class="rounded-lg border border-border p-4 gap-4 mb-6">
          <view class="flex-row items-center gap-3">
            <ui-skeleton class="h-10 w-10 rounded-full" />
            <view class="gap-2 flex-1">
              <ui-skeleton class="h-4 w-3/4" />
              <ui-skeleton class="h-3 w-1/2" />
            </view>
          </view>
          <ui-skeleton class="h-48 w-full rounded-md" />
          <view class="gap-2">
            <ui-skeleton class="h-4 w-full" />
            <ui-skeleton class="h-4 w-5/6" />
            <ui-skeleton class="h-4 w-4/6" />
          </view>
        </view>

        <!-- Profile skeleton -->
        <text class="text-sm font-medium text-muted-foreground mb-3">
          Profile Loading State
        </text>
        <view class="rounded-lg border border-border p-4 gap-4 mb-6">
          <view class="items-center gap-3">
            <ui-skeleton class="h-16 w-16 rounded-full" />
            <ui-skeleton class="h-5 w-32" />
            <ui-skeleton class="h-3 w-48" />
          </view>
        </view>

        <!-- List skeleton -->
        <text class="text-sm font-medium text-muted-foreground mb-3">
          List Loading State
        </text>
        <view class="rounded-lg border border-border p-4 gap-3">
          @for (item of [1, 2, 3]; track item) {
            <view class="flex-row items-center gap-3">
              <ui-skeleton class="h-8 w-8 rounded-full" />
              <view class="gap-1.5 flex-1">
                <ui-skeleton class="h-4 w-2/3" />
                <ui-skeleton class="h-3 w-1/3" />
              </view>
              <ui-skeleton class="h-6 w-16 rounded-md" />
            </view>
          }
        </view>
      </view>
    </scroll-view>
  `,
})
export class App {}

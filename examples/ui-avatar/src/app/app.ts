import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { UiAvatar } from '@blotch/ui/components/avatar';

@Component({
  selector: 'app-root',
  imports: [LYNX_ELEMENTS, UiAvatar],
  template: `
    <scroll-view scroll-orientation="vertical" class="h-full">
      <view class="p-6">
        <text class="text-2xl font-bold text-foreground mb-6">Avatar</text>

        <!-- With images -->
        <text class="text-sm font-medium text-muted-foreground mb-3">
          With Images
        </text>
        <view class="flex-row items-center gap-3 mb-6">
          <ui-avatar src="https://i.pravatar.cc/150?img=1" />
          <ui-avatar src="https://i.pravatar.cc/150?img=5" />
          <ui-avatar src="https://i.pravatar.cc/150?img=12" />
        </view>

        <!-- Fallback initials -->
        <text class="text-sm font-medium text-muted-foreground mb-3">
          Fallback Initials
        </text>
        <view class="flex-row items-center gap-3 mb-6">
          <ui-avatar fallback="JD" />
          <ui-avatar fallback="AB" />
          <ui-avatar fallback="ZK" />
        </view>

        <!-- Sizes -->
        <text class="text-sm font-medium text-muted-foreground mb-3">Sizes</text>
        <view class="flex-row items-center gap-3 mb-6">
          <ui-avatar src="https://i.pravatar.cc/150?img=3" size="sm" />
          <ui-avatar src="https://i.pravatar.cc/150?img=3" size="default" />
          <ui-avatar src="https://i.pravatar.cc/150?img=3" size="lg" />
        </view>

        <!-- Sizes with fallback -->
        <text class="text-sm font-medium text-muted-foreground mb-3">
          Sizes with Fallback
        </text>
        <view class="flex-row items-center gap-3">
          <ui-avatar fallback="SM" size="sm" />
          <ui-avatar fallback="MD" size="default" />
          <ui-avatar fallback="LG" size="lg" />
        </view>
      </view>
    </scroll-view>
  `,
})
export class App {}

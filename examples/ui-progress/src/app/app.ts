import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { UiProgress } from '../components/ui/progress';
import { UiButton } from '../components/ui/button';

@Component({
  selector: 'app-root',
  imports: [LYNX_ELEMENTS, UiProgress, UiButton],
  template: `
    <scroll-view scroll-orientation="vertical" class="h-full">
      <view class="p-6">
        <text class="text-2xl font-bold text-foreground mb-6">Progress</text>

        <!-- Static values -->
        <text class="text-sm font-medium text-muted-foreground mb-3">
          Static Values
        </text>
        <view class="gap-4 mb-6">
          <view class="gap-1">
            <text class="text-xs text-muted-foreground">0%</text>
            <ui-progress [value]="0" />
          </view>
          <view class="gap-1">
            <text class="text-xs text-muted-foreground">25%</text>
            <ui-progress [value]="25" />
          </view>
          <view class="gap-1">
            <text class="text-xs text-muted-foreground">50%</text>
            <ui-progress [value]="50" />
          </view>
          <view class="gap-1">
            <text class="text-xs text-muted-foreground">75%</text>
            <ui-progress [value]="75" />
          </view>
          <view class="gap-1">
            <text class="text-xs text-muted-foreground">100%</text>
            <ui-progress [value]="100" />
          </view>
        </view>

        <!-- Custom max -->
        <text class="text-sm font-medium text-muted-foreground mb-3">
          Custom Max (200)
        </text>
        <view class="gap-1 mb-6">
          <text class="text-xs text-muted-foreground">150 / 200</text>
          <ui-progress [value]="150" [max]="200" />
        </view>

        <!-- Interactive -->
        <text class="text-sm font-medium text-muted-foreground mb-3">
          Interactive
        </text>
        <view class="gap-3">
          <view class="gap-1">
            <text class="text-xs text-muted-foreground">
              {{ dynamicValue() }}%
            </text>
            <ui-progress [value]="dynamicValue()" />
          </view>
          <view class="flex-row gap-2">
            <ui-button size="sm" variant="outline" (pressed)="decrease()">
              -10
            </ui-button>
            <ui-button size="sm" variant="outline" (pressed)="increase()">
              +10
            </ui-button>
            <ui-button size="sm" variant="secondary" (pressed)="reset()">
              Reset
            </ui-button>
          </view>
        </view>
      </view>
    </scroll-view>
  `,
})
export class App {
  readonly dynamicValue = signal(30);

  increase(): void {
    this.dynamicValue.update((v) => Math.min(100, v + 10));
  }

  decrease(): void {
    this.dynamicValue.update((v) => Math.max(0, v - 10));
  }

  reset(): void {
    this.dynamicValue.set(0);
  }
}

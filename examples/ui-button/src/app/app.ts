import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { UiButton } from '@blotch/ui';

@Component({
  selector: 'app-root',
  imports: [LYNX_ELEMENTS, UiButton],
  template: `
    <scroll-view scroll-orientation="vertical" class="flex-1">
      <view class="flex flex-col gap-6 p-6">
        <text class="text-2xl font-bold text-foreground">Button</text>
        <text class="text-sm text-muted-foreground">
          A versatile button component with multiple variants and sizes.
        </text>

        <!-- Variants -->
        <view class="flex flex-col gap-3">
          <text class="text-lg font-semibold text-foreground">Variants</text>
          <view class="flex flex-row flex-wrap gap-3">
            <ui-button variant="default" (pressed)="onPress('default')">
              Default
            </ui-button>
            <ui-button variant="destructive" (pressed)="onPress('destructive')">
              Destructive
            </ui-button>
            <ui-button variant="outline" (pressed)="onPress('outline')">
              Outline
            </ui-button>
            <ui-button variant="secondary" (pressed)="onPress('secondary')">
              Secondary
            </ui-button>
            <ui-button variant="ghost" (pressed)="onPress('ghost')">
              Ghost
            </ui-button>
          </view>
        </view>

        <!-- Sizes -->
        <view class="flex flex-col gap-3">
          <text class="text-lg font-semibold text-foreground">Sizes</text>
          <view class="flex flex-row flex-wrap items-center gap-3">
            <ui-button size="sm">Small</ui-button>
            <ui-button size="default">Default</ui-button>
            <ui-button size="lg">Large</ui-button>
            <ui-button size="icon">+</ui-button>
          </view>
        </view>

        <!-- Disabled -->
        <view class="flex flex-col gap-3">
          <text class="text-lg font-semibold text-foreground">Disabled</text>
          <view class="flex flex-row flex-wrap gap-3">
            <ui-button [disabled]="true">Disabled</ui-button>
            <ui-button variant="destructive" [disabled]="true">
              Disabled
            </ui-button>
            <ui-button variant="outline" [disabled]="true">
              Disabled
            </ui-button>
          </view>
        </view>

        <!-- Loading -->
        <view class="flex flex-col gap-3">
          <text class="text-lg font-semibold text-foreground">Loading</text>
          <view class="flex flex-row flex-wrap gap-3">
            <ui-button [loading]="true">Loading</ui-button>
            <ui-button variant="secondary" [loading]="true">
              Loading
            </ui-button>
            <ui-button variant="outline" [loading]="true">
              Loading
            </ui-button>
          </view>
        </view>

        <!-- Interactive -->
        <view class="flex flex-col gap-3">
          <text class="text-lg font-semibold text-foreground">Interactive</text>
          <view class="flex flex-row items-center gap-3">
            <ui-button (pressed)="onPress('tap')">Tap me</ui-button>
            <text class="text-sm text-muted-foreground">
              Pressed: {{ pressCount() }} times
            </text>
          </view>
        </view>
      </view>
    </scroll-view>
  `,
})
export class App {
  readonly pressCount = signal(0);

  onPress(variant: string): void {
    this.pressCount.update((n) => n + 1);
  }
}

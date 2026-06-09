import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { UiEmptyState, UiButton } from '@blotch/ui';

@Component({
  selector: 'app-root',
  imports: [LYNX_ELEMENTS, UiEmptyState, UiButton],
  template: `
    <view class="p-6">
      <text class="text-2xl font-bold text-foreground mb-6">Empty State</text>

      <!-- With icon and description -->
      <text class="text-sm font-medium text-muted-foreground mb-3">
        With Icon and Description
      </text>
      <view class="rounded-lg border border-border mb-6">
        <ui-empty-state
          icon="search"
          title="No results found"
          description="Try adjusting your search or filters to find what you're looking for."
        />
      </view>

      <!-- Without icon -->
      <text class="text-sm font-medium text-muted-foreground mb-3">
        Without Icon
      </text>
      <view class="rounded-lg border border-border mb-6">
        <ui-empty-state
          title="Nothing here yet"
          description="Content will appear here once it's available."
        />
      </view>

      <!-- With action button -->
      <text class="text-sm font-medium text-muted-foreground mb-3">
        With Action
      </text>
      <view class="rounded-lg border border-border">
        <ui-empty-state
          icon="plus"
          title="No items"
          description="Get started by creating your first item."
        >
          <ui-button class="mt-4" (pressed)="onCreate()">
            Create Item
          </ui-button>
        </ui-empty-state>
      </view>
    </view>
  `,
})
export class App {
  onCreate(): void {
    // Placeholder for demo purposes
  }
}

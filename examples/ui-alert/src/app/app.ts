import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { UiAlert } from '@blotch/ui';

@Component({
  selector: 'app-root',
  imports: [LYNX_ELEMENTS, UiAlert],
  template: `
    <view class="flex flex-col gap-4 p-6">
      <text class="text-2xl font-bold text-foreground">Alert</text>

      <!-- Default variant -->
      <ui-alert
        title="Heads up!"
        description="You can add components to your app using the CLI."
      />

      <!-- Destructive variant -->
      <ui-alert
        variant="destructive"
        title="Error"
        description="Your session has expired. Please log in again."
      />

      <!-- Title only -->
      <ui-alert title="Note: All data has been saved." />

      <!-- With content projection -->
      <ui-alert title="Update available">
        <text class="text-sm text-muted-foreground mt-2">
          A new version of the app is ready. Restart to apply changes.
        </text>
      </ui-alert>
    </view>
  `,
})
export class App {}

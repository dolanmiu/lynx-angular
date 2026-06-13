import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view scroll-orientation="vertical" style="height: 100%;">
      <view style="padding: 24px;">
        <text style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">
          Title Bar View
        </text>

        <text style="font-size: 14px; color: #666; margin-bottom: 16px;">
          A custom frameless window title bar. The draggable region allows
          moving the window, while the close button remains interactive.
        </text>

        <view
          style="height: 48px; flex-direction: row; align-items: center; background-color: #f5f5f5; border-radius: 8px;"
        >
          <title-bar-view moveable="true" style="flex: 1; height: 100%;">
            <text style="font-size: 14px; padding-left: 16px;">My App</text>
          </title-bar-view>
          <view
            (bindtap)="close()"
            style="width: 48px; height: 100%; align-items: center; justify-content: center;"
          >
            <text>X</text>
          </view>
        </view>

        <view
          style="margin-top: 16px; padding: 12px; background-color: #f5f5f5; border-radius: 8px;"
        >
          <text style="font-size: 13px; color: #333;">
            {{ message() }}
          </text>
        </view>
      </view>
    </scroll-view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  message = signal('Drag the title bar to move the window.');

  close(): void {
    this.message.set('Close button tapped!');
  }
}

import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <view style="padding: 24px;">
      <text style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">
        View Element
      </text>

      <view
        style="background-color: #f5f5f5; border-radius: 12px; padding: 16px;"
      >
        <view
          style="flex-direction: row; align-items: center; margin-bottom: 12px;"
        >
          <view
            style="width: 40px; height: 40px; border-radius: 20px; background-color: #6200ee; align-items: center; justify-content: center;"
          >
            <text style="color: white; font-weight: bold;">A</text>
          </view>
          <text style="font-size: 16px; font-weight: bold; margin-left: 12px;">
            Card Title
          </text>
        </view>
        <text style="font-size: 14px; color: #666;">
          Views are the basic building block for layout. They support flexbox
          properties for arranging children.
        </text>
      </view>
    </view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {}

import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <view style="padding: 24px;">
      <text style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">
        Text Element
      </text>

      <text style="font-size: 16px; margin-bottom: 12px;">
        Regular text with
        <text style="font-weight: bold;"> bold </text>
        and
        <text style="color: #dd0031;"> colored </text>
        inline content.
      </text>

      <text style="font-size: 14px; color: #666;" [text-maxline]="2">
        This is a long paragraph that demonstrates text truncation with
        text-maxline. When the text exceeds two lines, it will be truncated with
        an ellipsis at the end of the second line.
      </text>
    </view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {}

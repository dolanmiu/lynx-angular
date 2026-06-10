import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import styles from './demo.module.css';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view scroll-orientation="vertical" style="height: 100%;">
      <view style="padding: 24px;">
        <text style="font-size: 20px; font-weight: bold; margin-bottom: 16px;">
          CSS Modules
        </text>

        <view [class]="styles['card']">
          <text [class]="styles['title']">Styled Card</text>
          <text style="font-size: 14px; color: #666;">
            This card uses hashed CSS Module classes
          </text>
        </view>

        <view [class]="styles['highlight']">
          <text style="font-size: 14px;">Highlighted Section</text>
        </view>

        <view
          style="background-color: #f5f5f5; padding: 12px; border-radius: 8px; margin-top: 16px;"
        >
          <text
            style="font-size: 12px; font-weight: bold; color: #666; margin-bottom: 4px;"
          >
            Hashed class names:
          </text>
          <text style="font-size: 11px; color: #999;">
            card → {{ styles['card'] }}
          </text>
          <text style="font-size: 11px; color: #999;">
            title → {{ styles['title'] }}
          </text>
        </view>
      </view>
    </scroll-view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  readonly styles = styles;
}

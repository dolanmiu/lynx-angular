import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import styles from './demo.module.css';

@Component({
  selector: 'app-css-modules-demo',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  template: `
    <view class="container">
      <text class="page-title">CSS Modules Demo</text>

      <!-- Styled via CSS Modules hashed class names -->
      <view [class]="styles['card']">
        <text [class]="styles['title']">Card Title (CSS Module)</text>
        <text
          >This card is styled with a hashed class from demo.module.css</text
        >
      </view>

      <view [class]="styles['highlight']">
        <text>Highlighted section via CSS Modules</text>
      </view>

      <view [class]="styles['card']">
        <view [class]="styles['badge']">
          <text style="color: white; font-size: 12px">Badge</text>
        </view>
        <text>Card with a badge element</text>
      </view>

      <!-- Debug: show the raw hashed class names -->
      <view class="debug-section">
        <text class="debug-title">Debug: Hashed Class Names</text>
        <text class="debug-text">card → {{ styles['card'] }}</text>
        <text class="debug-text">title → {{ styles['title'] }}</text>
        <text class="debug-text">highlight → {{ styles['highlight'] }}</text>
        <text class="debug-text">badge → {{ styles['badge'] }}</text>
      </view>
    </view>
  `,
  styles: [
    `
      .container {
        padding: 16px;
      }

      .page-title {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 16px;
      }

      .debug-section {
        margin-top: 24px;
        padding: 12px;
        background-color: #f5f5f5;
        border-radius: 8px;
      }

      .debug-title {
        font-size: 14px;
        font-weight: bold;
        color: #666;
        margin-bottom: 8px;
      }

      .debug-text {
        font-size: 12px;
        color: #999;
        font-family: monospace;
        margin-bottom: 4px;
      }
    `,
  ],
})
export class CssModulesDemoComponent {
  readonly styles = styles;
}

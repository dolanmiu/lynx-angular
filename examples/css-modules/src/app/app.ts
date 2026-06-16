import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import styles from './demo.module.css';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="page" scroll-orientation="vertical">
      <view class="container">
        <text class="title">CSS Modules</text>
        <text class="subtitle">Scoped, hashed class names for style isolation.</text>

        <view [class]="styles['card']">
          <text [class]="styles['title']">Styled Card</text>
          <text class="card-desc">
            This card uses hashed CSS Module classes.
          </text>
        </view>

        <view [class]="styles['highlight']">
          <text class="highlight-text">Highlighted Section</text>
        </view>

        <view class="info-card">
          <text class="info-label">Hashed class names</text>
          <text class="info-value">card → {{ styles['card'] }}</text>
          <text class="info-value">title → {{ styles['title'] }}</text>
        </view>
      </view>
    </scroll-view>
  `,
  styles: `
    .page { height: 100%; background-color: #fafafa; }
    .container { padding: 24px; }
    .title { font-size: 28px; font-weight: bold; color: #18181b; margin-bottom: 4px; }
    .subtitle { font-size: 13px; color: #71717a; margin-bottom: 20px; }
    .card-desc { font-size: 13px; color: #71717a; }
    .highlight-text { font-size: 14px; color: #4338ca; }
    .info-card { background-color: #f4f4f5; border-radius: 12px; padding: 14px; margin-top: 16px; }
    .info-label { font-size: 11px; font-weight: 700; color: #a1a1aa; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-value { font-size: 11px; color: #71717a; margin-bottom: 2px; }
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  readonly styles = styles;
}

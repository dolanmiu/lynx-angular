import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="page" scroll-orientation="vertical">
      <view class="container">
        <text class="title">List Element</text>
        <text class="subtitle">
          A virtualized list for efficient rendering of large datasets.
        </text>

        <view class="card">
          <text class="section-label">50 Items</text>
          <list list-type="single" scroll-orientation="vertical" class="list">
            @for (item of items(); track item.id) {
              <list-item [attr.item-key]="item.id">
                <view class="list-row">
                  <view class="list-avatar">
                    <text class="list-avatar-text">{{ item.id }}</text>
                  </view>
                  <text class="list-item-text">{{ item.name }}</text>
                </view>
              </list-item>
            }
          </list>
        </view>
      </view>
    </scroll-view>
  `,
  styles: `
    .page {
      height: 100%;
      background-color: #fafafa;
    }
    .container {
      padding: 24px;
    }
    .title {
      font-size: 28px;
      font-weight: bold;
      color: #18181b;
      margin-bottom: 4px;
    }
    .subtitle {
      font-size: 13px;
      color: #71717a;
      margin-bottom: 20px;
    }
    .card {
      background-color: #ffffff;
      border: 1px solid #e4e4e7;
      border-radius: 12px;
      padding: 16px;
      overflow: hidden;
    }
    .section-label {
      font-size: 11px;
      font-weight: 700;
      color: #a1a1aa;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .list {
      height: 300px;
    }
    .list-row {
      padding: 12px 0;
      border-bottom: 1px solid #e4e4e7;
      flex-direction: row;
      align-items: center;
    }
    .list-avatar {
      width: 32px;
      height: 32px;
      border-radius: 16px;
      background-color: #eef2ff;
      align-items: center;
      justify-content: center;
    }
    .list-avatar-text {
      font-size: 12px;
      font-weight: 600;
      color: #6366f1;
    }
    .list-item-text {
      font-size: 15px;
      color: #18181b;
    }
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  readonly items = signal(
    Array.from({ length: 50 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Item ${i + 1}`,
    })),
  );
}

import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="page" scroll-orientation="vertical">
      <view class="container">
        <text class="title">View Element</text>
        <text class="subtitle">
          The basic building block for layout with flexbox support.
        </text>

        <view class="card">
          <text class="section-label">Card Layout</text>
          <view class="demo-card">
            <view class="row">
              <view class="avatar">
                <text class="avatar-text">A</text>
              </view>
              <view class="info">
                <text class="card-title">Card Title</text>
                <text class="card-desc">
                  Views are the basic building block for layout. They support
                  flexbox properties for arranging children.
                </text>
              </view>
            </view>
          </view>
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
      margin-bottom: 16px;
    }
    .section-label {
      font-size: 11px;
      font-weight: 700;
      color: #a1a1aa;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .demo-card {
      background-color: #f4f4f5;
      border-radius: 10px;
      padding: 16px;
    }
    .row {
      flex-direction: row;
      align-items: center;
    }
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 20px;
      background-color: #6366f1;
      align-items: center;
      justify-content: center;
    }
    .avatar-text {
      color: white;
      font-weight: bold;
      font-size: 16px;
    }
    .info {
      margin-left: 12px;
      flex: 1;
    }
    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #18181b;
      margin-bottom: 4px;
    }
    .card-desc {
      font-size: 13px;
      color: #71717a;
      line-height: 18px;
    }
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {}

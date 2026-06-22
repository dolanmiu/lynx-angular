import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="page" scroll-orientation="vertical">
      <view class="container">
        <text class="title">Block Element</text>
        <text class="subtitle">
          A non-visual container for conditional rendering.
        </text>

        <view class="btn" (bindtap)="toggle()">
          <text class="btn-text">Toggle Details</text>
        </view>

        <view class="card">
          <text class="section-label">Properties</text>
          <text class="prop">Name: Angular</text>

          @if (showDetails()) {
            <block>
              <text class="prop">Type: Framework</text>
              <text class="prop">Language: TypeScript</text>
            </block>
          }
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
    }
    .section-label {
      font-size: 11px;
      font-weight: 700;
      color: #a1a1aa;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .prop {
      font-size: 15px;
      color: #18181b;
      margin-bottom: 6px;
    }
    .btn {
      background-color: #6366f1;
      padding: 12px 24px;
      border-radius: 10px;
      align-items: center;
      margin-bottom: 16px;
    }
    .btn-text {
      color: white;
      font-size: 15px;
      font-weight: 600;
    }
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  readonly showDetails = signal(false);

  toggle(): void {
    this.showDetails.update((v) => !v);
  }
}

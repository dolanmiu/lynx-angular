import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="page" scroll-orientation="vertical">
      <view class="container">
        <text class="title">Input Element</text>
        <text class="subtitle"> Text input with reactive signal binding. </text>

        <view class="card">
          <text class="section-label">Try it</text>
          <input
            type="text"
            class="input"
            placeholder="Type your name..."
            (bindinput)="onInput($event)"
          />
        </view>

        <view class="result-card">
          <text class="greeting">Hello, {{ name() || 'stranger' }}!</text>
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
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .input {
      padding: 12px 14px;
      font-size: 15px;
      border: 1px solid #e4e4e7;
      border-radius: 8px;
      background-color: #ffffff;
    }
    .result-card {
      background-color: #eef2ff;
      border: 1px solid #c7d2fe;
      border-radius: 12px;
      padding: 16px;
      align-items: center;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #4338ca;
    }
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  readonly name = signal('');

  onInput(event: Event): void {
    this.name.set((event as CustomEvent<{ value: string }>).detail.value);
  }
}

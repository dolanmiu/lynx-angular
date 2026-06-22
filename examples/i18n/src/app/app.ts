import { Component, inject, signal } from '@angular/core';
import { LYNX_ELEMENTS, LynxLocale } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="page" scroll-orientation="vertical">
      <view class="container">
        <text class="title">i18n</text>
        <text class="subtitle"
          >Internationalization with Angular and Lynx.</text
        >

        <view class="locale-badge">
          <text class="locale-text">
            Locale: {{ localeService.locale() }}
          </text>
        </view>

        <view class="card">
          <text class="section-label">Translated Strings</text>
          <text i18n="@@app.greeting" class="greeting"> Hello, world! </text>
          <text class="welcome">{{ welcomeMessage }}</text>
          <text
            i18n="
              app description|A brief description of the i18n
              example@@app.description"
            class="description"
          >
            This is an internationalization example with Angular on Lynx.
          </text>
        </view>

        <view class="card">
          <text class="section-label">Counter</text>
          <text class="counter">{{ counterMessage() }}</text>
          <view class="btn" (bindtap)="increment()">
            <text i18n="@@app.tap_button" class="btn-text">
              Tap to increment
            </text>
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
    .locale-badge {
      background-color: #eef2ff;
      padding: 10px 14px;
      border-radius: 8px;
      margin-bottom: 16px;
    }
    .locale-text {
      font-size: 13px;
      font-weight: 600;
      color: #4338ca;
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
    .greeting {
      font-size: 18px;
      color: #18181b;
      margin-bottom: 8px;
    }
    .welcome {
      font-size: 15px;
      color: #18181b;
      margin-bottom: 8px;
    }
    .description {
      font-size: 13px;
      color: #71717a;
    }
    .counter {
      font-size: 18px;
      color: #18181b;
      margin-bottom: 12px;
    }
    .btn {
      background-color: #6366f1;
      padding: 12px 24px;
      border-radius: 10px;
      align-items: center;
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
  readonly localeService = inject(LynxLocale);
  readonly count = signal(0);
  readonly userName = 'Angular Developer';

  get welcomeMessage(): string {
    return $localize`:@@app.welcome:Welcome, ${this.userName}:userName:!`;
  }

  counterMessage() {
    const count = this.count();
    return $localize`:@@app.counter:Counter: ${count}:count:`;
  }

  increment(): void {
    this.count.update((n) => n + 1);
  }
}

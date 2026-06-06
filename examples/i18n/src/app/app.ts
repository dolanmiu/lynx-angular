import { Component, inject, signal } from '@angular/core';
import { LYNX_ELEMENTS, LynxLocale } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <view style="padding: 24px; align-items: center;">
      <text style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">
        i18n Example
      </text>

      <view
        style="background-color: #e8f5e9; padding: 12px; border-radius: 8px; margin-bottom: 16px; width: 100%;"
      >
        <text style="font-size: 14px; color: #2e7d32;">
          Locale: {{ localeService.locale() }}
        </text>
      </view>

      <text i18n="@@app.greeting" style="font-size: 18px; margin-bottom: 12px;">
        Hello, world!
      </text>

      <text style="font-size: 16px; margin-bottom: 12px;">
        {{ welcomeMessage }}
      </text>

      <text
        i18n="
          app description|A brief description of the i18n
          example@@app.description"
        style="font-size: 14px; color: #666; margin-bottom: 16px;"
      >
        This is an internationalization example with Angular on Lynx.
      </text>

      <text style="font-size: 18px; margin-bottom: 16px;">
        {{ counterMessage() }}
      </text>

      <view
        style="background-color: #6200ee; padding: 12px 24px; border-radius: 8px;"
        (bindtap)="increment()"
      >
        <text i18n="@@app.tap_button" style="color: white; font-size: 16px;">
          Tap to increment
        </text>
      </view>
    </view>
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

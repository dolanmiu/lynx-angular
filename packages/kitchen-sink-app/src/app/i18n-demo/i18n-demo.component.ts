import { Component, inject, signal } from '@angular/core';
import { LYNX_ELEMENTS, LynxLocaleService } from '@blotch/angular-lynx';

@Component({
  selector: 'app-i18n-demo',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  template: `
    <view style="padding: 16px;">
      <text style="font-size: 20px; font-weight: bold; margin-bottom: 12px;">
        i18n Demo
      </text>

      <view
        style="background-color: #e8f5e9; padding: 12px; border-radius: 8px; margin-bottom: 12px;"
      >
        <text style="font-size: 14px; color: #2e7d32;">
          Current locale: {{ localeService.locale() }}
        </text>
      </view>

      <text
        i18n="@@kitchen.greeting"
        style="font-size: 16px; margin-bottom: 8px;"
      >
        Hello from the kitchen sink!
      </text>

      <text style="font-size: 16px; margin-bottom: 8px;">
        {{ welcomeMessage }}
      </text>

      <text style="font-size: 16px; margin-bottom: 8px;">
        {{ counterMessage() }}
      </text>

      <view
        style="background-color: #6200ee; padding: 10px 20px; border-radius: 8px; margin-top: 8px;"
        (bindtap)="increment()"
      >
        <text i18n="@@kitchen.tap" style="color: white; font-size: 14px;">
          Tap to count
        </text>
      </view>
    </view>
  `,
})
export class I18nDemoComponent {
  readonly localeService = inject(LynxLocaleService);
  readonly count = signal(0);

  get welcomeMessage(): string {
    return $localize`:@@kitchen.welcome:Welcome to the i18n demo!`;
  }

  counterMessage() {
    const count = this.count();
    return $localize`:@@kitchen.counter:You tapped ${count}:count: times`;
  }

  increment(): void {
    this.count.update((n) => n + 1);
  }
}

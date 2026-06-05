import { Component, inject, signal } from '@angular/core';
import { loadTranslations } from '@angular/localize';
import { LYNX_ELEMENTS, LynxLocaleService } from '@blotch/angular-lynx';

// cspell:disable
const FRENCH_TRANSLATIONS: Record<string, string> = {
  'kitchen.greeting': 'Bonjour depuis le kitchen sink !',
  'kitchen.welcome': 'Bienvenue dans la démo i18n !',
  'kitchen.tap': 'Appuyez pour compter',
  'kitchen.counter': 'Vous avez appuyé {$count} fois',
  'kitchen.switchToFr': 'Passer en anglais',
  'kitchen.switchToEn': 'Passer en français',
};
// cspell:enable

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

      <text style="font-size: 16px; margin-bottom: 8px;">
        {{ greetingMessage }}
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
        <text style="color: white; font-size: 14px;">
          {{ tapMessage }}
        </text>
      </view>

      <view
        style="background-color: #1565c0; padding: 10px 20px; border-radius: 8px; margin-top: 12px;"
        (bindtap)="toggleLocale()"
      >
        <text style="color: white; font-size: 14px;">
          {{ switchLabel }}
        </text>
      </view>
    </view>
  `,
})
export class I18nDemoComponent {
  readonly localeService = inject(LynxLocaleService);
  readonly count = signal(0);
  readonly isFrench = signal(false);

  get greetingMessage(): string {
    return $localize`:@@kitchen.greeting:Hello from the kitchen sink!`;
  }

  get welcomeMessage(): string {
    return $localize`:@@kitchen.welcome:Welcome to the i18n demo!`;
  }

  get tapMessage(): string {
    return $localize`:@@kitchen.tap:Tap to count`;
  }

  get switchLabel(): string {
    return $localize`:@@kitchen.switchToEn:Switch to French`;
  }

  counterMessage() {
    const count = this.count();
    return $localize`:@@kitchen.counter:You tapped ${count}:count: times`;
  }

  increment(): void {
    this.count.update((n) => n + 1);
  }

  toggleLocale(): void {
    const switchingToFrench = !this.isFrench();
    this.isFrench.set(switchingToFrench);

    if (switchingToFrench) {
      loadTranslations(FRENCH_TRANSLATIONS);
    } else {
      // Clear translations to restore English source strings
      (globalThis.$localize as any).TRANSLATIONS = {};
    }
  }
}

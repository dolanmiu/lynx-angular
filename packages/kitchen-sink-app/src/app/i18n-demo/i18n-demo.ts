import { Component, inject, signal } from '@angular/core';
import { clearTranslations, loadTranslations } from '@angular/localize';
import { LYNX_ELEMENTS, LynxLocale } from '@blotch/angular-lynx';

// cspell:disable
const FRENCH_TRANSLATIONS: Record<string, string> = {
  'kitchen.greeting': 'Bonjour depuis le kitchen sink !',
  'kitchen.welcome': 'Bienvenue dans la démo i18n !',
  'kitchen.tap': 'Appuyez pour compter',
  'kitchen.counter': 'Vous avez appuyé {$count} fois',
  'kitchen.switchToFr': 'Passer en anglais',
  'kitchen.switchToEn': 'Passer en français',
};
/**
 * cspell:enable
 */

@Component({
  selector: 'app-i18n-demo',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  template: `
    <view class="p-4">
      <text class="text-xl font-bold mb-3"> i18n Demo </text>

      <view class="bg-green-50 p-3 rounded-lg mb-3">
        <text class="text-sm text-green-800">
          Current locale: {{ localeService.locale() }}
        </text>
      </view>

      <text class="text-base mb-2">
        {{ greetingMessage }}
      </text>

      <text class="text-base mb-2">
        {{ welcomeMessage }}
      </text>

      <text class="text-base mb-2">
        {{ counterMessage() }}
      </text>

      <view
        class="bg-[#6200ee] px-5 py-2.5 rounded-lg mt-2"
        (bindtap)="increment()"
      >
        <text class="text-white text-sm">
          {{ tapMessage }}
        </text>
      </view>

      <view
        class="bg-[#1565c0] px-5 py-2.5 rounded-lg mt-3"
        (bindtap)="toggleLocale()"
      >
        <text class="text-white text-sm">
          {{ switchLabel }}
        </text>
      </view>
    </view>
  `,
})
export class I18nDemo {
  readonly localeService = inject(LynxLocale);
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
      clearTranslations();
    }
  }
}

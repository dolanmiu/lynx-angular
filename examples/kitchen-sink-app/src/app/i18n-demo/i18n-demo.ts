import { Component, inject, signal } from '@angular/core';
import { clearTranslations, loadTranslations } from '@angular/localize';
import { LYNX_ELEMENTS, LynxLocale } from '@blotch/angular-lynx';
import { DemoScreen } from '../demo-screen/demo-screen';
import { ScreenHost } from '../screen-host';

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
  hostDirectives: [ScreenHost],
  standalone: true,
  imports: [LYNX_ELEMENTS, DemoScreen],
  template: `
    <app-demo-screen
      heading="i18n"
      category="Platform"
      description="Localization with @angular/localize."
    >
      <view class="mb-3 rounded-lg bg-green-50 p-3">
        <text class="text-sm text-green-800">
          Current locale: {{ localeService.locale() }}
        </text>
      </view>

      <text class="mb-2 text-base">
        {{ greetingMessage }}
      </text>

      <text class="mb-2 text-base">
        {{ welcomeMessage }}
      </text>

      <text class="mb-2 text-base">
        {{ counterMessage() }}
      </text>

      <view
        class="mt-2 rounded-lg bg-[#6200ee] px-5 py-2.5"
        (bindtap)="increment()"
      >
        <text class="text-sm text-white">
          {{ tapMessage }}
        </text>
      </view>

      <view
        class="mt-3 rounded-lg bg-[#1565c0] px-5 py-2.5"
        (bindtap)="toggleLocale()"
      >
        <text class="text-sm text-white">
          {{ switchLabel }}
        </text>
      </view>
    </app-demo-screen>
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

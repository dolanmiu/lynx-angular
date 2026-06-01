import { loadTranslations } from '@angular/localize';
import { bootstrapApplication } from '@blotch/angular-lynx';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

// Determine the runtime locale from Lynx global props.
// In a real app, the native host sets lynx.__globalProps.appLocale.
const locale =
  typeof lynx !== 'undefined'
    ? (lynx.__globalProps as Record<string, unknown>)?.['appLocale']
    : undefined;

if (locale === 'fr') {
  loadTranslations({
    'app.greeting': 'Bonjour le monde !',
    'app.welcome': 'Bienvenue, {$userName} !',
    'app.description':
      "Ceci est un exemple d'internationalisation avec Angular sur Lynx.",
    'app.counter': 'Compteur : {$count}',
    'app.tap_button': 'Appuyez pour incrémenter',
  });
}

bootstrapApplication(AppComponent, appConfig);

import {
  type ApplicationConfig,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideLynxRenderer, provideLynxRouter } from '@blotch/angular-lynx';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideLynxRenderer(),
    // Diagnostic: empty routes, no RouterOutlet — testing if just the provider breaks things
    provideLynxRouter([]),
  ],
};

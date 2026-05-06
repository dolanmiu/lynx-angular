import {
  type ApplicationConfig,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideLynxRenderer, provideLynxRouter } from '@blotch/angular-lynx';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideLynxRenderer(),
    provideLynxRouter(routes),
  ],
};

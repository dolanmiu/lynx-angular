import {
  type ApplicationConfig,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { provideLynxRenderer } from '@blotch/angular-lynx';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideLynxRenderer(),
  ],
};

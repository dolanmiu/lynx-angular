import {
  type ApplicationConfig,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideLynxRenderer } from '@blotch/angular-lynx';

export const appConfig: ApplicationConfig = {
  providers: [provideZonelessChangeDetection(), provideLynxRenderer()],
};

import {
  type ApplicationConfig,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideLynxRenderer } from '@blotch/ng-lynx';

export const appConfig: ApplicationConfig = {
  providers: [provideZonelessChangeDetection(), provideLynxRenderer()],
};

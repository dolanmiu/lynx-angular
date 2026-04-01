import { PlatformLocation } from '@angular/common';
import {
  type EnvironmentProviders,
  makeEnvironmentProviders,
} from '@angular/core';
import {
  provideRouter,
  type RouterFeatures,
  type Routes,
} from '@angular/router';
import { LynxPlatformLocation } from './lynx-platform-location';

/**
 * Provides Angular Router configured for the Lynx runtime.
 *
 * Registers `LynxPlatformLocation` as the `PlatformLocation` so Angular's
 * router doesn't fall back to `BrowserPlatformLocation`, which uses `new URL()`
 * — a global that doesn't exist in Lynx's JS runtime.
 */
export const provideLynxRouter = (
  routes: Routes,
  ...features: RouterFeatures[]
): EnvironmentProviders => {
  return makeEnvironmentProviders([
    { provide: PlatformLocation, useClass: LynxPlatformLocation },
    provideRouter(routes, ...features),
  ]);
};

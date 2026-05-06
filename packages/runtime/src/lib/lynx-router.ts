import { LocationStrategy, PlatformLocation } from '@angular/common';
import {
  type EnvironmentProviders,
  makeEnvironmentProviders,
} from '@angular/core';
import {
  provideRouter,
  type RouterFeatures,
  type Routes,
  withRouterConfig,
} from '@angular/router';
import { LynxLocationStrategy } from './lynx-location-strategy';
import { LynxPlatformLocation } from './lynx-platform-location';

/**
 * Provides Angular Router configured for the Lynx runtime.
 *
 * Uses `LynxLocationStrategy` (in-memory routing) instead of Angular's default
 * `PathLocationStrategy` which relies on browser History/Location APIs. This is
 * the Angular equivalent of React Router's `MemoryRouter` — Lynx is a native
 * mobile runtime with no browser URL or History API.
 */
export const provideLynxRouter = (
  routes: Routes,
  ...features: RouterFeatures[]
): EnvironmentProviders => {
  return makeEnvironmentProviders([
    // In-memory routing — Lynx has no browser URL/history APIs.
    // Replaces the default BrowserPlatformLocation → PathLocationStrategy chain.
    // LynxPlatformLocation must be registered first: without it Angular falls back to
    // BrowserPlatformLocation, whose `this.location` is undefined in Lynx (no window.location),
    // so any access to `pathname`/`href` throws a TypeError that silently kills navigation.
    { provide: PlatformLocation, useClass: LynxPlatformLocation },
    { provide: LocationStrategy, useClass: LynxLocationStrategy },
    provideRouter(
      routes,
      // Lynx runs Angular on a background thread for layout calculation.
      // Unhandled navigation promise rejections (e.g. from unmatched routes)
      // crash the background thread, causing a blank screen with no errors.
      // Resolving as false instead of rejecting prevents this.
      withRouterConfig({ resolveNavigationPromiseOnError: true }),
      ...features,
    ),
  ]);
};

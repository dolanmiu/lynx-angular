import type { ApplicationConfig, ApplicationRef, Type } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { firstValueFrom, Subject } from 'rxjs';

if (typeof document === 'undefined') {
  (globalThis as any).document = {
    // BrowserPlatformLocation uses document.defaultView to get the window
    // for addEventListener('popstate'/'hashchange'). Point to our window mock.
    defaultView: globalThis,
    // getBaseHrefFromDOM() calls document.querySelector('base').
    // Return null so Angular falls back to APP_BASE_HREF (provided in provideLynxRenderer).
    querySelector: () => null,
  };
}

if (typeof window === 'undefined') {
  (globalThis as any).window = globalThis;
}

// BrowserPlatformLocation.onPopState/onHashChange call window.addEventListener.
// Lynx runtime doesn't have this API, so stub it out as a no-op.
if (typeof globalThis.addEventListener !== 'function') {
  (globalThis as any).addEventListener = () => {};
}
if (typeof globalThis.removeEventListener !== 'function') {
  (globalThis as any).removeEventListener = () => {};
}

// Lynx provides timer/scheduling APIs on the `lynx` global, not on `globalThis`.
// Angular's zoneless ChangeDetectionScheduler uses setTimeout to schedule CD
// after markForCheck(). Without these polyfills, CD never fires after the initial
// synchronous render, so dynamic content (RouterOutlet, signal updates) never appears.
// React Lynx does the same polyfill — see @lynx-js/react worklet-runtime/api/lynxApi.ts.
if (
  typeof globalThis.setTimeout !== 'function' &&
  typeof lynx !== 'undefined'
) {
  const _lynx = lynx as any;
  (globalThis as any).setTimeout = _lynx.setTimeout;
  (globalThis as any).setInterval = _lynx.setInterval;
  (globalThis as any).clearTimeout = _lynx.clearTimeout;
  (globalThis as any).clearInterval =
    _lynx.clearInterval ?? _lynx.clearTimeInterval;
  if (_lynx.requestAnimationFrame) {
    (globalThis as any).requestAnimationFrame = _lynx.requestAnimationFrame;
  }
  if (_lynx.cancelAnimationFrame) {
    (globalThis as any).cancelAnimationFrame = _lynx.cancelAnimationFrame;
  }
}

// @ts-expect-error
globalThis.renderPage = () => {
  pageReady.next();
};

// @ts-expect-error
globalThis.updatePage = () => {};
// @ts-expect-error
globalThis.processData = () => {};
// @ts-expect-error
globalThis.runWorklet = (value, params) => {
  if (typeof value === 'function') {
    value(...params);
  }
};

const pageReady = new Subject<void>();

// const renderLynx = (cb: ()=> void): void => {
//   if(__MAIN_THREAD__){
//     pageReady.pipe(first()).subscribe(()=> {
//       cb();
//     });
//   } else {
//     cb();
//   }
// }

export const bootstrapLynxApplication = async (
  rootComponent: Type<unknown>,
  options?: ApplicationConfig,
): Promise<ApplicationRef> => {
  if (__MAIN_THREAD__) {
    await firstValueFrom(pageReady);
    return bootstrapApplication(rootComponent, options);
  }
  return bootstrapApplication(rootComponent, options);
};

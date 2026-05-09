import type { ApplicationConfig, ApplicationRef, Type } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { firstValueFrom, Subject } from 'rxjs';

// On-device diagnostic: capture the last unhandled error/rejection so Angular
// components can render it via <x-text>. There is no console on the Lynx device,
// so this is the only way to see what is crashing.
(globalThis as any).__lynxLastError = '';
if (typeof (globalThis as any).onerror !== 'function') {
  (globalThis as any).onerror = (
    msg: string | Event,
    _src?: string,
    _line?: number,
    _col?: number,
    err?: Error,
  ) => {
    (globalThis as any).__lynxLastError = err
      ? `${err.name}: ${err.message}\n${err.stack ?? ''}`
      : String(msg);
  };
}
if (typeof (globalThis as any).onunhandledrejection !== 'function') {
  (globalThis as any).onunhandledrejection = (event: PromiseRejectionEvent) => {
    const reason = event?.reason;
    (globalThis as any).__lynxLastError =
      reason instanceof Error
        ? `Unhandled rejection: ${reason.name}: ${reason.message}\n${reason.stack ?? ''}`
        : `Unhandled rejection: ${String(reason)}`;
  };
}

// Angular Router v21+ uses AbortController in its navigation pipeline.
// The rsbuild plugin's polyfills.js provides this as preEntry, but this
// defensive polyfill covers consumers not using the plugin.
if (typeof AbortController === 'undefined') {
  class LynxAbortSignal {
    aborted = false;
    reason: unknown = undefined;
    _listeners: ((event: { type: string }) => void)[] = [];
    addEventListener(
      type: string,
      listener: (event: { type: string }) => void,
    ) {
      if (type === 'abort') this._listeners.push(listener);
    }
    removeEventListener(
      type: string,
      listener: (event: { type: string }) => void,
    ) {
      if (type === 'abort') {
        this._listeners = this._listeners.filter((l) => l !== listener);
      }
    }
    dispatchEvent(event: { type: string }) {
      if (event.type === 'abort') {
        for (const listener of this._listeners.slice()) {
          listener(event);
        }
      }
      return true;
    }
    throwIfAborted() {
      if (this.aborted) throw this.reason;
    }
  }
  (globalThis as any).AbortSignal = LynxAbortSignal;
  (globalThis as any).AbortController = class LynxAbortController {
    signal = new LynxAbortSignal();
    abort(reason?: unknown) {
      if (this.signal.aborted) return;
      this.signal.aborted = true;
      if (reason === undefined) {
        const err = new Error('This operation was aborted');
        err.name = 'AbortError';
        reason = err;
      }
      this.signal.reason = reason;
      this.signal.dispatchEvent({ type: 'abort' });
    }
  };
}

// Angular core uses queueMicrotask for effect scheduling and change detection.
// React Lynx polyfills this from lynx.queueMicrotask (see motion/src/polyfill/shim.ts).
if (typeof globalThis.queueMicrotask !== 'function') {
  if (typeof lynx !== 'undefined' && (lynx as any).queueMicrotask) {
    (globalThis as any).queueMicrotask = (lynx as any).queueMicrotask;
  } else {
    const resolved = Promise.resolve();
    (globalThis as any).queueMicrotask = (fn: () => void) => {
      resolved.then(fn).catch((err: unknown) => {
        setTimeout(() => {
          throw err;
        }, 0);
      });
    };
  }
}

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
  }
  const appRef = await bootstrapApplication(rootComponent, options);
  return appRef;
};

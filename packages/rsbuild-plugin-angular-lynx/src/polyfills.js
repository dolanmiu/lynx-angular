// Angular Router v21+ uses AbortController in its navigation pipeline
// (NavigationTransitions.setupNavigations). Lynx's PrimJS runtime lacks
// this Web Platform API. Without it, the Router's switchMap throws a
// ReferenceError that is silently swallowed by subscribe({ error: e => {} }),
// causing the entire navigation pipeline to die — zero events, navigated
// stays false, navigateByUrl() hangs forever.
if (typeof AbortController === 'undefined') {
  class LynxAbortSignal {
    constructor() {
      this.aborted = false;
      this.reason = undefined;
      this._listeners = [];
    }
    addEventListener(type, listener) {
      if (type === 'abort') this._listeners.push(listener);
    }
    removeEventListener(type, listener) {
      if (type === 'abort') {
        this._listeners = this._listeners.filter((l) => l !== listener);
      }
    }
    dispatchEvent(event) {
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
  globalThis.AbortSignal = LynxAbortSignal;
  globalThis.AbortController = class LynxAbortController {
    constructor() {
      this.signal = new LynxAbortSignal();
    }
    abort(reason) {
      if (this.signal.aborted) return;
      this.signal.aborted = true;
      // Standard default is DOMException('AbortError'), but DOMException is
      // unavailable in Lynx. A plain Error with name='AbortError' works —
      // Angular only does signal.reason + '' (string coercion).
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

if (typeof performance === 'undefined') {
  globalThis.performance = undefined;
}
if (typeof queueMicrotask === 'undefined') {
  globalThis.queueMicrotaskPromiseCache = Promise.resolve();
  globalThis.queueMicrotask = (cb) =>
    globalThis.queueMicrotaskPromiseCache.then(cb);
}

// Lynx runtime doesn't have browser globals. Mock them early (before Angular
// platform initialization) so BrowserPlatformLocation's constructor doesn't
// crash when accessing window.location / window.history.
if (typeof document === 'undefined') {
  globalThis.document = {
    defaultView: globalThis,
    querySelector: () => null,
  };
}
if (typeof window === 'undefined') {
  globalThis.window = globalThis;
}
// BrowserPlatformLocation reads window.location and window.history in its
// constructor. Even though LynxPlatformLocation replaces it via DI, Angular
// may still construct BrowserPlatformLocation as a transitive dependency
// (e.g. through providedIn:'platform' factories). These stubs prevent the
// constructor from crashing with "cannot read property 'pathname' of undefined".
if (typeof globalThis.location === 'undefined') {
  globalThis.location = {
    href: 'lynx://app/',
    protocol: 'lynx:',
    host: 'app',
    hostname: 'app',
    port: '',
    pathname: '/',
    search: '',
    hash: '',
    origin: 'lynx://app',
    assign: () => {},
    reload: () => {},
    replace: () => {},
    toString: () => 'lynx://app/',
  };
}
if (typeof globalThis.history === 'undefined') {
  globalThis.history = {
    length: 1,
    state: null,
    scrollRestoration: 'auto',
    back: () => {},
    forward: () => {},
    go: () => {},
    pushState: () => {},
    replaceState: () => {},
  };
}
if (typeof globalThis.addEventListener !== 'function') {
  globalThis.addEventListener = () => {};
}
if (typeof globalThis.removeEventListener !== 'function') {
  globalThis.removeEventListener = () => {};
}

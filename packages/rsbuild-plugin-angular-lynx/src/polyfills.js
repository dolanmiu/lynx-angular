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

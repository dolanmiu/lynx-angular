import type { Type } from '@angular/core';

declare const __MAIN_THREAD__: boolean;

const cache = new Map<string, Promise<Type<unknown>>>();

/**
 * Loads an external Lynx component bundle at runtime and returns the Angular
 * component type. Wraps the native `__QueryComponent` PAPI — bundles must be
 * built with `experimental_isLazyBundle: true` in the rsbuild plugin.
 */
export const loadLazyBundle = (source: string): Promise<Type<unknown>> => {
  const cached = cache.get(source);
  if (cached) {
    return cached;
  }

  const promise = loadBundle(source);
  cache.set(source, promise);
  return promise;
};

const loadBundle = (source: string): Promise<Type<unknown>> => {
  if (typeof __QueryComponent !== 'function') {
    return Promise.reject(
      new Error(
        `loadLazyBundle: __QueryComponent is not available. ` +
          `Ensure you are running in a Lynx environment.`,
      ),
    );
  }

  if (__MAIN_THREAD__) {
    return loadOnMainThread(source);
  }

  return loadOnBackgroundThread(source);
};

const loadOnMainThread = (source: string): Promise<Type<unknown>> => {
  try {
    const result = __QueryComponent(source, () => {});
    const exports = result.evalResult as Record<string, unknown>;
    const component = (exports?.['default'] ?? exports) as Type<unknown>;
    return Promise.resolve(component);
  } catch (e) {
    // Main thread renders once for first-screen — return a never-resolving
    // promise so Lynx doesn't crash on failed lazy loads (matches React Lynx).
    reportError(source, e);
    return new Promise(() => {});
  }
};

const loadOnBackgroundThread = (source: string): Promise<Type<unknown>> => {
  return new Promise((resolve, reject) => {
    __QueryComponent(source, (result) => {
      if (result.code === 0) {
        try {
          const exports = result.data.evalResult(source) as Record<
            string,
            unknown
          >;
          const component = (exports?.['default'] ?? exports) as Type<unknown>;
          resolve(component);
        } catch (e) {
          const error = new Error(
            `loadLazyBundle: Failed to evaluate bundle "${source}"`,
            { cause: e },
          );
          reportError(source, error);
          reject(error);
        }
      } else {
        const error = new Error(
          `loadLazyBundle: Failed to load bundle "${source}" (code: ${result.code})`,
        );
        reportError(source, error);
        reject(error);
      }
    });
  });
};

const reportError = (source: string, cause: unknown): void => {
  if (typeof _ReportError === 'function') {
    const error =
      cause instanceof Error
        ? cause
        : new Error(`loadLazyBundle failed for "${source}"`);
    _ReportError(error, { errorCode: 6 });
  }
};

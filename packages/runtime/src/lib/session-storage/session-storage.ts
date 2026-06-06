import type { Injector } from '@angular/core';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import type { SessionStorageSubscription } from './session-storage.types';

/**
 * Wraps Lynx's session storage API for sharing data across multiple LynxViews.
 *
 * Session storage is a key-value store that persists for the lifetime of the
 * host app session. Unlike browser localStorage, values are objects (not strings)
 * and reads are asynchronous (callback-based in the native API, Promise-based here).
 *
 * The `setSessionStorageItem` / `getSessionStorageItem` / `subscribeSessionStorage` /
 * `unsubscribeSessionStorage` methods are not declared in `@lynx-js/types`, so we
 * access them via `any` — the APIs are stable and documented on lynxjs.org.
 *
 * @usageNotes
 * ```typescript
 * const sessionStorage = inject(LynxSessionStorage);
 *
 * // Write
 * sessionStorage.setItem('theme', { mode: 'dark' });
 *
 * // One-shot read
 * const theme = await sessionStorage.getItem<{ mode: string }>('theme');
 *
 * // Reactive signal (auto-subscribes, auto-cleans up with injection context)
 * const theme = sessionStorage.watch<{ mode: string }>('theme');
 * // theme() updates whenever another LynxView calls setItem('theme', ...)
 * ```
 */
@Injectable({ providedIn: 'root' })
export class LynxSessionStorage {
  // In-memory fallback when native session storage is unavailable (web preview, tests, SSR).
  readonly #store = new Map<string, unknown>();
  readonly #listeners = new Map<
    string,
    Map<number, (value: unknown) => void>
  >();
  #nextId = 0;

  #hasNativeSessionStorage(): boolean {
    return (
      typeof lynx !== 'undefined' &&
      typeof (lynx as any).setSessionStorageItem === 'function'
    );
  }

  /**
   * Stores a value in session storage, shared across all LynxViews.
   * Existing subscribers for this key will be notified of the change.
   */
  setItem<T = unknown>(key: string, value: T): void {
    if (this.#hasNativeSessionStorage()) {
      (lynx as any).setSessionStorageItem(key, value);
      return;
    }

    this.#store.set(key, value);
    const keyListeners = this.#listeners.get(key);
    if (keyListeners) {
      for (const [, cb] of keyListeners) cb(value);
    }
  }

  /**
   * Reads a value from session storage. The native API is callback-based;
   * this wraps it in a Promise for ergonomic use with `async`/`await`.
   */
  getItem<T = unknown>(key: string): Promise<T> {
    if (this.#hasNativeSessionStorage()) {
      return new Promise<T>((resolve) => {
        (lynx as any).getSessionStorageItem(key, (value: T) => resolve(value));
      });
    }

    return Promise.resolve(this.#store.get(key) as T);
  }

  /**
   * Subscribes to changes for a session storage key. The callback fires
   * whenever any LynxView calls `setItem` with the same key.
   *
   * Returns the subscription needed for {@link unsubscribe}.
   */
  subscribe<T = unknown>(
    key: string,
    callback: (value: T) => void,
  ): SessionStorageSubscription {
    if (this.#hasNativeSessionStorage()) {
      const listenerId: number = (lynx as any).subscribeSessionStorage(
        key,
        callback,
      );
      return { key, listenerId };
    }

    const id = this.#nextId++;
    let keyListeners = this.#listeners.get(key);
    if (!keyListeners) {
      keyListeners = new Map();
      this.#listeners.set(key, keyListeners);
    }
    keyListeners.set(id, callback as (value: unknown) => void);
    return { key, listenerId: id };
  }

  /**
   * Cancels a session storage subscription created by {@link subscribe}.
   */
  unsubscribe(subscription: SessionStorageSubscription): void {
    if (this.#hasNativeSessionStorage()) {
      (lynx as any).unsubscribeSessionStorage(
        subscription.key,
        subscription.listenerId,
      );
      return;
    }

    this.#listeners.get(subscription.key)?.delete(subscription.listenerId);
  }

  /**
   * Creates a reactive signal that tracks a session storage key.
   *
   * Seeds the signal with the current value via `getItem`, then subscribes
   * to future changes. The subscription is automatically cleaned up when the
   * calling component/service is destroyed.
   *
   * Must be called from an injection context (constructor, field initializer,
   * or `runInInjectionContext`) unless an explicit `injector` is provided.
   */
  watch<T = unknown>(
    key: string,
    options?: { injector?: Injector },
  ): ReturnType<typeof signal<T | undefined>> {
    const value = signal<T | undefined>(undefined);

    // Seed with current value.
    this.getItem<T>(key).then((v) => value.set(v));

    // Subscribe to future changes.
    const subscription = this.subscribe<T>(key, (v) => value.set(v));

    // Auto-cleanup when the caller's injection context is destroyed.
    const destroyRef = options?.injector
      ? options.injector.get(DestroyRef)
      : inject(DestroyRef);
    destroyRef.onDestroy(() => this.unsubscribe(subscription));

    return value;
  }
}

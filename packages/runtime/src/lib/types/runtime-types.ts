import type { TouchEvent } from '@lynx-js/types';

declare global {
  /**
   * Determines if code should be placed in the background thread, used as a compile-time define macro
   */
  let __BACKGROUND__: boolean;
  /**
   * Determines if code should be placed in the main thread, used as a compile-time define macro
   */
  let __MAIN_THREAD__: boolean;
  /**
   * Determines if running in dev mode
   */
  let __DEV__: boolean;
  /**
   * Determines if running in profile mode
   */
  let __PROFILE__: boolean;
  /**
   * Full URL of the dev log server (e.g. http://192.168.1.91:3001/__dev_logs).
   * Injected by the rsbuild plugin's DefinePlugin in dev builds only.
   */
  let __DEV_LOG_URL__: string;

  // MTS worklet registry — set up in runtime.ts, used by mainThreadFn()
  // oxlint-disable-next-line typescript/consistent-type-definitions -- interface required for global augmentation
  interface Window {
    registerWorklet: (type: string, id: string, fn: Function) => void;
    __workletRefMap: Record<number, { current: unknown }>;
    __lynxMtsPendingResolvers: Record<
      number,
      { resolve: (v: unknown) => void; reject: (e: unknown) => void }
    >;
    __lynxMtsNextResolveId: () => number;
  }
  // eslint-disable-next-line no-var
  var registerWorklet: (type: string, id: string, fn: Function) => void;
  // eslint-disable-next-line no-var
  var __workletRefMap: Record<number, { current: unknown }>;
  // eslint-disable-next-line no-var
  var __lynxMtsPendingResolvers: Record<
    number,
    { resolve: (v: unknown) => void; reject: (e: unknown) => void }
  >;
  // eslint-disable-next-line no-var
  var __lynxMtsNextResolveId: () => number;
  // Available on main thread only — dispatches a function call to the background thread
  function runOnBackground(
    handle: { _wkltId: string },
    ...args: unknown[]
  ): Promise<unknown>;
}

declare global {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- interface required for global augmentation
  interface HTMLElementEventMap {
    bindtap: TouchEvent;
    catchtap: TouchEvent;
    'capture-bindtap': TouchEvent;
    'capture-catchtap': TouchEvent;
    'global-bindtap': TouchEvent;
    bindtouchstart: TouchEvent;
    bindtouchend: TouchEvent;
    bindtouchmove: TouchEvent;
    bindtouchcancel: TouchEvent;
    bindlongpress: TouchEvent;
    catchtouchstart: TouchEvent;
    catchtouchend: TouchEvent;
    catchtouchmove: TouchEvent;
    catchtouchcancel: TouchEvent;
    catchlongpress: TouchEvent;
  }
}

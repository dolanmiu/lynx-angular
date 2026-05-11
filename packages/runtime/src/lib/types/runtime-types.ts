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
  let __DEV__: boolean; //TODO: implement
  /**
   * Determines if running in profile mode
   */
  let __PROFILE__: boolean; //TODO: implement
  /**
   * Full URL of the dev log server (e.g. http://192.168.1.91:3001/__dev_logs).
   * Injected by the rsbuild plugin's DefinePlugin in dev builds only.
   */
  let __DEV_LOG_URL__: string;
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

import { Injectable, signal } from '@angular/core';
import type { GlobalData } from './data-flow.types';

@Injectable({ providedIn: 'root' })
export class LynxGlobalDataService {
  // Seeded from lynx.__globalProps at construction time; updated via onGlobalPropsChanged.
  readonly globalData = signal<GlobalData>(
    typeof lynx !== 'undefined'
      ? (lynx.__globalProps as GlobalData)
      : ({} as GlobalData),
  );

  constructor() {
    if (
      typeof lynx === 'undefined' ||
      (typeof __MAIN_THREAD__ !== 'undefined' && __MAIN_THREAD__) ||
      typeof lynx.getJSModule !== 'function'
    )
      return;
    const emitter = lynx.getJSModule('GlobalEventEmitter');
    if (!emitter?.addListener) return;
    emitter.addListener('onGlobalPropsChanged', (...args: unknown[]) =>
      this.globalData.set(args[0] as GlobalData),
    );
  }
}

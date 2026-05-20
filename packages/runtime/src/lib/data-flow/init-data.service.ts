import { Injectable, signal } from '@angular/core';
import type { InitData } from './data-flow.types';

@Injectable({ providedIn: 'root' })
export class LynxInitDataService {
  // Seeded from lynx.__initData at construction time; updated reactively via onDataChanged.
  // __initData is not declared in @lynx-js/types, so we access it via any.
  readonly initData = signal<InitData>(
    typeof lynx !== 'undefined'
      ? ((lynx as any).__initData as InitData)
      : ({} as InitData),
  );

  constructor() {
    if (typeof lynx === 'undefined') return;
    lynx
      .getJSModule('GlobalEventEmitter')
      .addListener('onDataChanged', (...args: unknown[]) =>
        this.initData.set(args[0] as InitData),
      );
  }
}

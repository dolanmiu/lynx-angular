import { Injectable, signal } from '@angular/core';
import type { GlobalProps } from './data-flow.types';

@Injectable({ providedIn: 'root' })
export class LynxGlobalPropsService {
  // Seeded from lynx.__globalProps at construction time; updated via onGlobalPropsChanged.
  readonly globalProps = signal<GlobalProps>(
    typeof lynx !== 'undefined'
      ? (lynx.__globalProps as GlobalProps)
      : ({} as GlobalProps),
  );

  constructor() {
    if (typeof lynx === 'undefined') return;
    lynx
      .getJSModule('GlobalEventEmitter')
      .addListener('onGlobalPropsChanged', (...args: unknown[]) =>
        this.globalProps.set(args[0] as GlobalProps),
      );
  }
}

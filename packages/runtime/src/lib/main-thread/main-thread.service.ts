import { Injectable } from '@angular/core';
import type { MainThreadFnHandle } from './main-thread-fn';

@Injectable({ providedIn: 'root' })
export class LynxMainThreadService {
  runOnMainThread<TArgs extends unknown[], TReturn>(
    handle: MainThreadFnHandle<TArgs, TReturn>,
    ...args: TArgs
  ): Promise<TReturn> {
    if (__MAIN_THREAD__) {
      throw new Error(
        'runOnMainThread() must be called from the background thread',
      );
    }

    if (__DEV__) {
      try {
        JSON.stringify(args);
      } catch {
        throw new Error(
          '[angular-lynx] MTS arguments must be JSON-serializable',
        );
      }
    }

    const resolveId = (globalThis as any).__lynxMtsNextResolveId();
    const pendingResolvers = (globalThis as any).__lynxMtsPendingResolvers;

    return new Promise<TReturn>((resolve, reject) => {
      pendingResolvers[resolveId] = { resolve, reject };

      try {
        (lynx as any).getCoreContext().dispatchEvent({
          type: 'Lynx.Worklet.runWorkletCtx',
          data: JSON.stringify({
            worklet: { _wkltId: handle._wkltId },
            params: args,
            resolveId,
          }),
        });
      } catch (e) {
        delete pendingResolvers[resolveId];
        reject(e);
      }
    });
  }
}

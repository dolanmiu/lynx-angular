import { Injectable } from '@angular/core';
import type { MainThreadFnHandle } from './main-thread-fn';

// Injectable service for calling main-thread (Lepus) functions from the
// background thread. Uses Lynx's cross-thread RPC via JSContext events:
//
//   background calls runOnMainThread(handle, ...args)
//   → dispatches 'Lynx.Worklet.runWorkletCtx' with { worklet, params, resolveId }
//   → main thread's listener (in runtime.ts) invokes the registered worklet fn
//   → dispatches 'Lynx.Worklet.FunctionCallRet' with { resolveId, returnValue }
//   → background thread's listener resolves the Promise
//
// This enables background-thread Angular code (services, effects) to trigger
// main-thread imperative operations (animate, measure, invoke UI methods)
// with proper async/await ergonomics.
@Injectable({ providedIn: 'root' })
export class LynxMainThread {
  runOnMainThread<TArgs extends unknown[], TReturn>(
    handle: MainThreadFnHandle<TArgs, TReturn>,
    ...args: TArgs
  ): Promise<TReturn> {
    if (__MAIN_THREAD__) {
      throw new Error(
        'runOnMainThread() must be called from the background thread',
      );
    }

    // Cross-thread params are JSON-serialized via dispatchEvent — non-serializable
    // values (functions, circular refs) would silently become null/undefined on the
    // main thread, leading to hard-to-debug runtime errors.
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

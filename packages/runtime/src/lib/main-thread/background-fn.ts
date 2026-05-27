// Counter stays in sync across threads because both bundles evaluate
// the same module graph in the same order.
let nextBgWorkletId = 0;

export type BackgroundFnHandle<
  TArgs extends unknown[] = unknown[],
  TReturn = unknown,
> = {
  readonly _wkltId: string;
  readonly _workletType: 'background';
  readonly __isBackgroundFn: true;
  readonly __args?: TArgs;
  readonly __return?: TReturn;
};

export const backgroundFn = <TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn,
): BackgroundFnHandle<TArgs, TReturn> => {
  const id = '__angular_bg_' + nextBgWorkletId++;

  if (!__MAIN_THREAD__) {
    globalThis.registerWorklet('background', id, fn);
  }

  return {
    _wkltId: id,
    _workletType: 'background',
    __isBackgroundFn: true,
  } as BackgroundFnHandle<TArgs, TReturn>;
};

// Reset counter on HMR
export const __resetBgWorkletCounter = (): void => {
  nextBgWorkletId = 0;
};

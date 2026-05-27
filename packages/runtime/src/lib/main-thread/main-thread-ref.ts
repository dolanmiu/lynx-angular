let nextRefId = 0;

export class MainThreadRef<T> {
  readonly _wvid: number;
  #_value: T;

  constructor(initValue: T) {
    this._wvid = nextRefId++;
    this.#_value = initValue;

    if (__MAIN_THREAD__) {
      (globalThis as any).__workletRefMap[this._wvid] = this;
    }
  }

  get current(): T {
    return this.#_value;
  }

  set current(value: T) {
    this.#_value = value;
  }

  toJSON(): { _wvid: number } {
    return { _wvid: this._wvid };
  }
}

export const createMainThreadRef = <T>(initValue: T): MainThreadRef<T> =>
  new MainThreadRef(initValue);

// Reset counter on HMR
export const __resetRefCounter = (): void => {
  nextRefId = 0;
};

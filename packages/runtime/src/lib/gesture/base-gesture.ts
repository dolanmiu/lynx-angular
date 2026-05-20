import type { GestureStateManager } from './state-manager';
import type { GestureCallback, GestureEvent, GestureType } from './types';

let nextGestureId = 1;

export type GestureCallbackWithState<
  TEvent extends GestureEvent = GestureEvent,
> = (event: TEvent, stateManager: GestureStateManager) => void;

export abstract class BaseGesture<
  TEvent extends GestureEvent = GestureEvent,
  TSelf extends BaseGesture<TEvent, any> = any,
> {
  readonly id = nextGestureId++;
  abstract readonly type: GestureType;

  /** @internal — accessed by the directive to build the PAPI config. */
  _callbacks: Record<string, GestureCallback<TEvent>> = {};
  /** @internal */
  _config: Record<string, unknown> = {};
  /** @internal */
  _waitFor: BaseGesture[] = [];
  /** @internal */
  _simultaneousWith: BaseGesture[] = [];
  /** @internal */
  _continueWith: BaseGesture[] = [];

  onBegin(cb: GestureCallbackWithState<TEvent>): TSelf {
    this._callbacks['onBegin'] = cb as GestureCallback<TEvent>;
    return this as unknown as TSelf;
  }

  onStart(cb: GestureCallbackWithState<TEvent>): TSelf {
    this._callbacks['onStart'] = cb as GestureCallback<TEvent>;
    return this as unknown as TSelf;
  }

  onEnd(cb: GestureCallbackWithState<TEvent>): TSelf {
    this._callbacks['onEnd'] = cb as GestureCallback<TEvent>;
    return this as unknown as TSelf;
  }

  onTouchesDown(cb: GestureCallbackWithState<TEvent>): TSelf {
    this._callbacks['onTouchesDown'] = cb as GestureCallback<TEvent>;
    return this as unknown as TSelf;
  }

  onTouchesUp(cb: GestureCallbackWithState<TEvent>): TSelf {
    this._callbacks['onTouchesUp'] = cb as GestureCallback<TEvent>;
    return this as unknown as TSelf;
  }

  waitFor(...gestures: BaseGesture[]): TSelf {
    this._waitFor.push(...gestures);
    return this as unknown as TSelf;
  }

  simultaneousWith(...gestures: BaseGesture[]): TSelf {
    this._simultaneousWith.push(...gestures);
    return this as unknown as TSelf;
  }

  continueWith(...gestures: BaseGesture[]): TSelf {
    this._continueWith.push(...gestures);
    return this as unknown as TSelf;
  }

  enabled(value: boolean): TSelf {
    this._config['enabled'] = value;
    return this as unknown as TSelf;
  }
}

// Continuous gestures (pan, fling, rotation, pinch) have an onUpdate callback
// that fires on every frame while the gesture is active.
export abstract class ContinuousGesture<
  TEvent extends GestureEvent = GestureEvent,
  TSelf extends ContinuousGesture<TEvent, any> = any,
> extends BaseGesture<TEvent, TSelf> {
  onUpdate(cb: GestureCallbackWithState<TEvent>): TSelf {
    this._callbacks['onUpdate'] = cb as GestureCallback<TEvent>;
    return this as unknown as TSelf;
  }
}

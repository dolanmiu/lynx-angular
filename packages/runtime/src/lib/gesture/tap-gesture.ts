import { BaseGesture } from './base-gesture';
import { type TapGestureEvent, GestureType } from './types';

export class TapGesture extends BaseGesture<TapGestureEvent, TapGesture> {
  readonly type = GestureType.TAP;

  /**
   * For double/triple tap, pair with waitFor on the single-tap gesture so
   * the single-tap handler doesn't fire prematurely before the count is met.
   */
  numberOfTaps(count: number): this {
    this._config['numberOfTaps'] = count;
    return this;
  }

  /**
   * Maximum time between finger-down and finger-up for a tap to register.
   * Touches held longer than this are treated as a long-press.
   */
  maxDuration(ms: number): this {
    this._config['maxDuration'] = ms;
    return this;
  }

  /**
   * If the finger travels more than `px` pixels before lifting, the tap fails.
   * Keeps a tap distinct from a small drag.
   */
  maxDistance(px: number): this {
    this._config['maxDistance'] = px;
    return this;
  }
}

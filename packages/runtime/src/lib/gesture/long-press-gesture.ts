import { BaseGesture } from './base-gesture';
import { type LongPressGestureEvent, GestureType } from './types';

export class LongPressGesture extends BaseGesture<
  LongPressGestureEvent,
  LongPressGesture
> {
  readonly type = GestureType.LONGPRESS;

  /**
   * Minimum hold time in ms before the gesture is recognized.
   * Shorter presses are treated as taps and ignored.
   */
  minDuration(ms: number): this {
    this._config['minDuration'] = ms;
    return this;
  }

  /**
   * If the finger drifts more than `px` pixels from the initial touch point
   * during the hold, the gesture fails — allowing a scroll to take over.
   */
  maxDistance(px: number): this {
    this._config['maxDistance'] = px;
    return this;
  }
}

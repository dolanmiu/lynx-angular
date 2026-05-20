import { BaseGesture } from './base-gesture';
import { type LongPressGestureEvent, GestureType } from './types';

export class LongPressGesture extends BaseGesture<
  LongPressGestureEvent,
  LongPressGesture
> {
  readonly type = GestureType.LONGPRESS;

  minDuration(ms: number): this {
    this._config['minDuration'] = ms;
    return this;
  }

  maxDistance(px: number): this {
    this._config['maxDistance'] = px;
    return this;
  }
}

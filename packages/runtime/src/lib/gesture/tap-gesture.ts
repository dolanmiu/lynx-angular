import { BaseGesture } from './base-gesture';
import { type TapGestureEvent, GestureType } from './types';

export class TapGesture extends BaseGesture<TapGestureEvent, TapGesture> {
  readonly type = GestureType.TAP;

  numberOfTaps(count: number): this {
    this._config['numberOfTaps'] = count;
    return this;
  }

  maxDuration(ms: number): this {
    this._config['maxDuration'] = ms;
    return this;
  }

  maxDistance(px: number): this {
    this._config['maxDistance'] = px;
    return this;
  }
}

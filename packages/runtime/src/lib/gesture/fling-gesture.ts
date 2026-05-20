import { ContinuousGesture } from './base-gesture';
import {
  type FlingGestureEvent,
  type FlingDirection,
  GestureType,
} from './types';

export class FlingGesture extends ContinuousGesture<
  FlingGestureEvent,
  FlingGesture
> {
  readonly type = GestureType.FLING;

  direction(dir: FlingDirection): this {
    this._config['direction'] = dir;
    return this;
  }

  numberOfPointers(count: number): this {
    this._config['numberOfPointers'] = count;
    return this;
  }
}

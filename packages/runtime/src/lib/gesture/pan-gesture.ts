import { ContinuousGesture } from './base-gesture';
import { type PanGestureEvent, GestureType } from './types';

export class PanGesture extends ContinuousGesture<PanGestureEvent, PanGesture> {
  readonly type = GestureType.PAN;

  minDistance(distance: number): this {
    this._config['minDistance'] = distance;
    return this;
  }

  activeOffsetX(offset: number | [number, number]): this {
    this._config['activeOffsetX'] = offset;
    return this;
  }

  activeOffsetY(offset: number | [number, number]): this {
    this._config['activeOffsetY'] = offset;
    return this;
  }

  failOffsetX(offset: number | [number, number]): this {
    this._config['failOffsetX'] = offset;
    return this;
  }

  failOffsetY(offset: number | [number, number]): this {
    this._config['failOffsetY'] = offset;
    return this;
  }

  minPointers(count: number): this {
    this._config['minPointers'] = count;
    return this;
  }

  maxPointers(count: number): this {
    this._config['maxPointers'] = count;
    return this;
  }
}

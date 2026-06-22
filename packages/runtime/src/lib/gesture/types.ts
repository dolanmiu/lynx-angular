/**
 * Gesture type IDs matching the Lynx native engine (from @lynx-js/react gesture-runtime).
 */
export enum GestureType {
  PAN = 0,
  FLING = 1,
  DEFAULT = 2,
  TAP = 3,
  LONGPRESS = 4,
  ROTATION = 5,
  PINCH = 6,
  NATIVE = 7,
}

export enum GestureState {
  UNDETERMINED = 0,
  BEGAN = 1,
  ACTIVE = 2,
  END = 3,
  FAILED = 4,
  CANCELLED = 5,
}

export type GestureEvent = {
  state: GestureState;
  absoluteX: number;
  absoluteY: number;
};

export type PanGestureEvent = {
  translationX: number;
  translationY: number;
  velocityX: number;
  velocityY: number;
} & GestureEvent;

export type TapGestureEvent = {
  x: number;
  y: number;
} & GestureEvent;

export type FlingGestureEvent = {
  velocityX: number;
  velocityY: number;
} & GestureEvent;

export type PinchGestureEvent = {
  scale: number;
  velocity: number;
} & GestureEvent;

export type RotationGestureEvent = {
  rotation: number;
  velocity: number;
} & GestureEvent;

export type LongPressGestureEvent = {
  x: number;
  y: number;
  duration: number;
} & GestureEvent;

/**
 * Bitmask values — combine with bitwise OR for multi-direction fling:
 * e.g. FlingDirection.LEFT | FlingDirection.RIGHT for horizontal fling.
 */
export enum FlingDirection {
  RIGHT = 1,
  LEFT = 2,
  UP = 4,
  DOWN = 8,
}

export type GestureCallback<TEvent extends GestureEvent = GestureEvent> = (
  event: TEvent,
) => void;

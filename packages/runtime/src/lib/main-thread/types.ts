import type {
  Element as MtElement,
  TouchEvent as MtTouchEvent,
  MouseEvent as MtMouseEvent,
  WheelEvent as MtWheelEvent,
  KeyEvent as MtKeyEvent,
  AnimationEvent as MtAnimationEvent,
  TransitionEvent as MtTransitionEvent,
  LayoutChangeEvent as MtLayoutChangeEvent,
  UIAppearanceEvent as MtUIAppearanceEvent,
} from '@lynx-js/types/main-thread';

export namespace MainThread {
  export type Element = MtElement;
  export type TouchEvent = MtTouchEvent;
  export type MouseEvent = MtMouseEvent;
  export type WheelEvent = MtWheelEvent;
  export type KeyEvent = MtKeyEvent;
  export type AnimationEvent = MtAnimationEvent;
  export type TransitionEvent = MtTransitionEvent;
  export type LayoutChangeEvent = MtLayoutChangeEvent;
  export type UIAppearanceEvent = MtUIAppearanceEvent;
}

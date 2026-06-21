import type { ElementRef } from '../types/lynx';

// Controls gesture state from within a callback.
// Wraps __SetGestureState and __ConsumeGesture PAPI calls.
// Passed as the second argument to gesture callbacks so handlers can
// programmatically drive the gesture state machine (e.g. activate a gesture
// only when a condition is met, or fail it early to let a competing gesture win).
export class GestureStateManager {
  readonly #element: ElementRef;
  readonly #gestureId: number;

  constructor(element: ElementRef, gestureId: number) {
    this.#element = element;
    this.#gestureId = gestureId;
  }

  // State codes match Lynx's native gesture state enum:
  // 1 = ACTIVE, 2 = FAILED, 3 = END
  fail(): void {
    __SetGestureState(this.#element, this.#gestureId, 2);
  }

  activate(): void {
    __SetGestureState(this.#element, this.#gestureId, 1);
  }

  end(): void {
    __SetGestureState(this.#element, this.#gestureId, 3);
  }

  consumeGesture(consume = true): void {
    __ConsumeGesture(this.#element, this.#gestureId, { consume });
  }

  interceptGesture(intercept = true): void {
    __ConsumeGesture(this.#element, this.#gestureId, { inner: intercept });
  }
}

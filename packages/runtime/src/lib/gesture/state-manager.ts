import type { ElementRef } from '../types/lynx';

// Controls gesture state from within a callback.
// Wraps __SetGestureState and __ConsumeGesture PAPI calls.
export class GestureStateManager {
  readonly #element: ElementRef;
  readonly #gestureId: number;

  constructor(element: ElementRef, gestureId: number) {
    this.#element = element;
    this.#gestureId = gestureId;
  }

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

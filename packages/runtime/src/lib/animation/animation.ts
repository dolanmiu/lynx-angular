import type { ElementRef } from '../types/lynx';

/**
 * Options for controlling animation timing and behavior.
 * Accepts both Web Animations API naming (iterations, easing, fill)
 * and Lynx-native naming (iterationCount, timingFunction, fillMode).
 */
export type LynxAnimationOptions = {
  name?: string;
  duration?: number | string;
  delay?: number | string;
  iterationCount?: number | string;
  iterations?: number | string;
  fillMode?: string;
  fill?: string;
  timingFunction?: string;
  easing?: string;
  direction?: string;
};

// Wire-protocol constants for __ElementAnimate operations.
// Must match the native Lynx engine expectations (see PAPI types).
const ANIMATION_START = 0 as const;
const ANIMATION_PLAY = 1 as const;
const ANIMATION_PAUSE = 2 as const;
const ANIMATION_CANCEL = 3 as const;

/**
 * Represents a running animation on a Lynx element.
 * Created by calling `element.animate()` on a LynxElement.
 * Mirrors the Animation class from React Lynx's worklet-runtime.
 */
export class LynxAnimation {
  static #count = 0;

  readonly id: string;
  readonly #element: ElementRef;

  constructor(
    element: ElementRef,
    keyframes: Record<string, string | number>[],
    options: LynxAnimationOptions,
  ) {
    this.#element = element;
    this.id = `__lynx-angular-animation-${LynxAnimation.#count++}`;

    // Immediately start the animation on the native element.
    __ElementAnimate(this.#element, [
      ANIMATION_START,
      options.name ?? this.id,
      keyframes,
      options,
    ]);
  }

  play(): void {
    __ElementAnimate(this.#element, [ANIMATION_PLAY, this.id]);
  }

  pause(): void {
    __ElementAnimate(this.#element, [ANIMATION_PAUSE, this.id]);
  }

  cancel(): void {
    __ElementAnimate(this.#element, [ANIMATION_CANCEL, this.id]);
  }
}

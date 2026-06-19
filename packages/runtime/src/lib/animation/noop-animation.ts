import type { Animation as LynxJsAnimation } from '@lynx-js/types/main-thread';

/**
 * A no-op animation returned when `animate()` is called on the background
 * thread where `__ElementAnimate` is unavailable. Provides the same API
 * surface as `LynxAnimation` so callers can call `.cancel()`, `.pause()`,
 * `.play()` without crashing — the calls simply do nothing.
 */
export class NoopLynxAnimation implements Pick<
  LynxJsAnimation,
  'id' | 'cancel' | 'pause' | 'play'
> {
  static #count = 0;

  readonly id: string;

  constructor() {
    this.id = `__lynx-angular-noop-animation-${NoopLynxAnimation.#count++}`;
  }

  play(): void {
    // No-op — animation cannot run on the background thread.
  }

  pause(): void {
    // No-op — animation cannot run on the background thread.
  }

  cancel(): void {
    // No-op — animation cannot run on the background thread.
  }
}

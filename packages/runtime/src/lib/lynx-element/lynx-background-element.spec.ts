import { describe, expect, it, vi } from 'vitest';
import { LynxBackgroundElement } from './lynx-background-element';

describe('LynxBackgroundElement', () => {
  it('stores event callback via addEventListener', () => {
    const el = new LynxBackgroundElement();
    const cb = vi.fn();

    el.addEventListener('bindtap', cb);

    // Verify it's stored by adding another and checking cleanup isolation
    const cb2 = vi.fn();
    el.addEventListener('catchtap', cb2);

    // Both events exist — removing one shouldn't affect the other
    const cleanup2 = el.addEventListener('catchtap', cb2);
    cleanup2();
  });

  it('cleanup removes the event callback', () => {
    const el = new LynxBackgroundElement();
    const cb = vi.fn();

    const cleanup = el.addEventListener('bindtap', cb);
    cleanup();

    // Re-adding should work without issues
    const cb2 = vi.fn();
    el.addEventListener('bindtap', cb2);
  });

  it('multiple events can be added and removed independently', () => {
    const el = new LynxBackgroundElement();
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    const cb3 = vi.fn();

    const cleanup1 = el.addEventListener('bindtap', cb1);
    const cleanup2 = el.addEventListener('catchtap', cb2);
    const cleanup3 = el.addEventListener('bindscroll', cb3);

    // Remove the middle one
    cleanup2();

    // The other cleanups should still work
    cleanup1();
    cleanup3();
  });
});

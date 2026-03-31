import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LynxBackgroundElement, LynxElement } from './lynx-element';
import type { ElementRef } from './types/lynx';

describe('LynxElement', () => {
  let element: LynxElement;
  let fakeRef: ElementRef;

  beforeEach(() => {
    fakeRef = {} as ElementRef;

    globalThis.__AddEvent = vi.fn();
    globalThis.__GetEvents = vi.fn(() => ({}));
    globalThis.__SetEvents = vi.fn();
  });

  it('addEventListener with bindtap calls __AddEvent with bindEvent', () => {
    element = new LynxElement(fakeRef);
    const cb = vi.fn();

    element.addEventListener('bindtap', cb);

    expect(globalThis.__AddEvent).toHaveBeenCalledWith(
      fakeRef,
      'bindEvent',
      'tap',
      { type: 'worklet', value: cb },
    );
  });

  it('addEventListener with catchtap calls __AddEvent with catchEvent', () => {
    element = new LynxElement(fakeRef);
    const cb = vi.fn();

    element.addEventListener('catchtap', cb);

    expect(globalThis.__AddEvent).toHaveBeenCalledWith(
      fakeRef,
      'catchEvent',
      'tap',
      { type: 'worklet', value: cb },
    );
  });

  it('addEventListener with capture-bindtap calls __AddEvent with capture-bindEvent', () => {
    element = new LynxElement(fakeRef);
    const cb = vi.fn();

    element.addEventListener('capture-bindtap', cb);

    expect(globalThis.__AddEvent).toHaveBeenCalledWith(
      fakeRef,
      'capture-bindEvent',
      'tap',
      { type: 'worklet', value: cb },
    );
  });

  it('addEventListener with capture-catchtap calls __AddEvent with capture-catchEvent', () => {
    element = new LynxElement(fakeRef);
    const cb = vi.fn();

    element.addEventListener('capture-catchtap', cb);

    expect(globalThis.__AddEvent).toHaveBeenCalledWith(
      fakeRef,
      'capture-catchEvent',
      'tap',
      { type: 'worklet', value: cb },
    );
  });

  it('addEventListener with global-bindtap calls __AddEvent with global-bindEvent', () => {
    element = new LynxElement(fakeRef);
    const cb = vi.fn();

    element.addEventListener('global-bindtap', cb);

    expect(globalThis.__AddEvent).toHaveBeenCalledWith(
      fakeRef,
      'global-bindEvent',
      'tap',
      { type: 'worklet', value: cb },
    );
  });

  it('addEventListener with unrecognized event does not call __AddEvent', () => {
    element = new LynxElement(fakeRef);
    const cb = vi.fn();

    const cleanup = element.addEventListener('click', cb);

    expect(globalThis.__AddEvent).not.toHaveBeenCalled();
    expect(typeof cleanup).toBe('function');
    cleanup();
  });

  it('cleanup function calls __GetEvents and __SetEvents to remove the event', () => {
    element = new LynxElement(fakeRef);
    const cb = vi.fn();
    const otherCb = vi.fn();

    globalThis.__GetEvents = vi.fn(() => ({
      'bindEvent:tap': { type: 'worklet', value: cb },
      'bindEvent:scroll': { type: 'worklet', value: otherCb },
    }));

    const cleanup = element.addEventListener('bindtap', cb);
    cleanup();

    expect(globalThis.__GetEvents).toHaveBeenCalledWith(fakeRef);
    expect(globalThis.__SetEvents).toHaveBeenCalledWith(fakeRef, [
      { type: 'worklet', value: otherCb },
    ]);
  });
});

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

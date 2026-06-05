import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ElementRef } from '../types/lynx';
import { LynxElement } from './lynx-element';

describe('LynxElement', () => {
  let element: LynxElement;
  let fakeRef: ElementRef;

  beforeEach(() => {
    fakeRef = {} as ElementRef;

    globalThis.__AddClass = vi.fn();
    globalThis.__SetClasses = vi.fn();
    globalThis.__GetClasses = vi.fn(() => []);
    globalThis.__AddEvent = vi.fn();
    globalThis.__GetEvents = vi.fn(() => ({}));
    globalThis.__SetEvents = vi.fn();
  });

  describe('setAttribute("class", ...)', () => {
    it('calls __SetClasses with a single class name', () => {
      element = new LynxElement(fakeRef);
      element.setAttribute('class', 'text-white');
      expect(globalThis.__SetClasses).toHaveBeenCalledWith(
        fakeRef,
        'text-white',
      );
      expect(globalThis.__AddClass).not.toHaveBeenCalled();
    });

    it('calls __SetClasses with a space-separated class list', () => {
      // Regression: __AddClass treats its argument as a single class name, so
      // passing 'bg-blue-500 p-4 rounded-lg' would set one literal class
      // 'bg-blue-500 p-4 rounded-lg' and no CSS rule would ever match.
      element = new LynxElement(fakeRef);
      element.setAttribute('class', 'bg-blue-500 p-4 rounded-lg');
      expect(globalThis.__SetClasses).toHaveBeenCalledWith(
        fakeRef,
        'bg-blue-500 p-4 rounded-lg',
      );
      expect(globalThis.__AddClass).not.toHaveBeenCalled();
    });

    it('calls __SetClasses with empty string when value is null', () => {
      element = new LynxElement(fakeRef);
      element.setAttribute('class', null);
      expect(globalThis.__SetClasses).toHaveBeenCalledWith(fakeRef, '');
    });
  });

  describe('addClass', () => {
    it('calls __AddClass with the class name', () => {
      element = new LynxElement(fakeRef);
      element.addClass('active');
      expect(globalThis.__AddClass).toHaveBeenCalledWith(fakeRef, 'active');
    });
  });

  describe('setStyle', () => {
    it('calls __AddInlineStyle with the key and value', () => {
      globalThis.__AddInlineStyle = vi.fn();
      element = new LynxElement(fakeRef);

      element.setStyle('background-color', 'red');

      expect(globalThis.__AddInlineStyle).toHaveBeenCalledWith(
        fakeRef,
        'background-color',
        'red',
      );
    });

    it('passes dash-case keys through unchanged', () => {
      globalThis.__AddInlineStyle = vi.fn();
      element = new LynxElement(fakeRef);

      element.setStyle('margin-top', '10px');

      expect(globalThis.__AddInlineStyle).toHaveBeenCalledWith(
        fakeRef,
        'margin-top',
        '10px',
      );
    });

    it('passes values with !important suffix through unchanged', () => {
      globalThis.__AddInlineStyle = vi.fn();
      element = new LynxElement(fakeRef);

      element.setStyle('color', 'blue !important');

      expect(globalThis.__AddInlineStyle).toHaveBeenCalledWith(
        fakeRef,
        'color',
        'blue !important',
      );
    });
  });

  describe('removeStyle', () => {
    it('calls __AddInlineStyle with null to clear the style', () => {
      globalThis.__AddInlineStyle = vi.fn();
      element = new LynxElement(fakeRef);

      element.removeStyle('background-color');

      expect(globalThis.__AddInlineStyle).toHaveBeenCalledWith(
        fakeRef,
        'background-color',
        null,
      );
    });
  });

  describe('setInlineStyles', () => {
    it('calls __SetInlineStyles with the raw style string', () => {
      globalThis.__SetInlineStyles = vi.fn();
      element = new LynxElement(fakeRef);

      element.setInlineStyles('color: red; font-size: 16px');

      expect(globalThis.__SetInlineStyles).toHaveBeenCalledWith(
        fakeRef,
        'color: red; font-size: 16px',
      );
    });
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

  it('cleanup function calls __AddEvent with null to remove the event', () => {
    element = new LynxElement(fakeRef);
    const cb = vi.fn();

    const cleanup = element.addEventListener('bindtap', cb);
    (globalThis.__AddEvent as ReturnType<typeof vi.fn>).mockClear();
    cleanup();

    expect(globalThis.__AddEvent).toHaveBeenCalledWith(
      fakeRef,
      'bindEvent',
      'tap',
      null,
    );
  });
});

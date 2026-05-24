import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LynxGlobalPropsService } from './global-props.service';

describe('LynxGlobalPropsService', () => {
  afterEach(() => {
    delete (globalThis as any).lynx;
  });

  describe('when lynx is not defined', () => {
    it('initializes globalProps to an empty object', () => {
      const service = new LynxGlobalPropsService();

      expect(service.globalProps()).toEqual({});
    });

    it('does not throw when constructing without a lynx global', () => {
      expect(() => new LynxGlobalPropsService()).not.toThrow();
    });
  });

  describe('when lynx is defined', () => {
    let addListener: ReturnType<typeof vi.fn>;
    let getJSModule: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      addListener = vi.fn();
      getJSModule = vi.fn().mockReturnValue({ addListener });
      (globalThis as any).lynx = {
        __globalProps: { theme: 'dark' },
        getJSModule,
      };
    });

    it('seeds globalProps from lynx.__globalProps at construction', () => {
      const service = new LynxGlobalPropsService();

      expect(service.globalProps()).toEqual({ theme: 'dark' });
    });

    it('calls getJSModule with "GlobalEventEmitter"', () => {
      new LynxGlobalPropsService();

      expect(getJSModule).toHaveBeenCalledWith('GlobalEventEmitter');
    });

    it('registers a listener for the "onGlobalPropsChanged" event', () => {
      new LynxGlobalPropsService();

      expect(addListener).toHaveBeenCalledWith(
        'onGlobalPropsChanged',
        expect.any(Function),
      );
    });

    it('updates globalProps to the first argument when the listener is called', () => {
      const service = new LynxGlobalPropsService();
      const listener: (...args: unknown[]) => void =
        addListener.mock.calls[0][1];

      listener({ theme: 'light', locale: 'en' });

      expect(service.globalProps()).toEqual({ theme: 'light', locale: 'en' });
    });

    it('ignores extra arguments beyond the first when the listener fires', () => {
      const service = new LynxGlobalPropsService();
      const listener: (...args: unknown[]) => void =
        addListener.mock.calls[0][1];

      listener({ theme: 'light' }, 'extra', 42);

      expect(service.globalProps()).toEqual({ theme: 'light' });
    });

    it('replaces globalProps entirely on each successive update', () => {
      const service = new LynxGlobalPropsService();
      const listener: (...args: unknown[]) => void =
        addListener.mock.calls[0][1];

      listener({ a: 1 });
      listener({ b: 2 });

      expect(service.globalProps()).toEqual({ b: 2 });
    });
  });
});

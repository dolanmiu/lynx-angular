import type { EnvironmentInjector } from '@angular/core';
import { DestroyRef } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LynxSessionStorageService } from './session-storage.service';

const createMockInjector = () => {
  const destroyCallbacks: (() => void)[] = [];
  const mockDestroyRef: DestroyRef = {
    onDestroy: (cb: () => void) => {
      destroyCallbacks.push(cb);
      return () => {};
    },
  } as any;
  const injector = {
    get: (token: any) => {
      if (token === DestroyRef) return mockDestroyRef;
      throw new Error(`Unexpected token: ${token}`);
    },
  } as EnvironmentInjector;
  return { injector, destroyCallbacks };
};

describe('LynxSessionStorageService', () => {
  afterEach(() => {
    delete (globalThis as any).lynx;
  });

  describe('when lynx is not defined', () => {
    it('does not throw when constructing', () => {
      expect(() => new LynxSessionStorageService()).not.toThrow();
    });

    it('setItem stores in memory', () => {
      const service = new LynxSessionStorageService();
      service.setItem('key', { value: 1 });

      return expect(service.getItem('key')).resolves.toEqual({ value: 1 });
    });

    it('getItem resolves with undefined for unset key', async () => {
      const service = new LynxSessionStorageService();

      await expect(service.getItem('key')).resolves.toBeUndefined();
    });

    it('subscribe returns a subscription', () => {
      const service = new LynxSessionStorageService();

      const sub = service.subscribe('key', vi.fn());

      expect(sub).toEqual({ key: 'key', listenerId: expect.any(Number) });
    });

    it('setItem notifies subscribers', () => {
      const service = new LynxSessionStorageService();
      const callback = vi.fn();
      service.subscribe('key', callback);

      service.setItem('key', 42);

      expect(callback).toHaveBeenCalledWith(42);
    });

    it('unsubscribe stops notifications', () => {
      const service = new LynxSessionStorageService();
      const callback = vi.fn();
      const sub = service.subscribe('key', callback);
      service.unsubscribe(sub);

      service.setItem('key', 99);

      expect(callback).not.toHaveBeenCalled();
    });

    it('watch returns a functional signal', async () => {
      const service = new LynxSessionStorageService();
      const { injector } = createMockInjector();

      const value = service.watch<number>('counter', { injector });
      expect(value()).toBeUndefined();

      service.setItem('counter', 5);
      expect(value()).toBe(5);
    });
  });

  describe('when lynx is defined without session storage methods', () => {
    beforeEach(() => {
      (globalThis as any).lynx = {};
    });

    it('setItem stores in memory', () => {
      const service = new LynxSessionStorageService();
      service.setItem('key', 'hello');

      return expect(service.getItem('key')).resolves.toBe('hello');
    });

    it('getItem resolves with undefined for unset key', async () => {
      const service = new LynxSessionStorageService();

      await expect(service.getItem('missing')).resolves.toBeUndefined();
    });

    it('subscribe and setItem notify listeners', () => {
      const service = new LynxSessionStorageService();
      const callback = vi.fn();
      service.subscribe('key', callback);

      service.setItem('key', { data: true });

      expect(callback).toHaveBeenCalledWith({ data: true });
    });

    it('watch produces a reactive signal', () => {
      const service = new LynxSessionStorageService();
      const { injector } = createMockInjector();

      const counter = service.watch<number>('counter', { injector });
      expect(counter()).toBeUndefined();

      service.setItem('counter', 1);
      expect(counter()).toBe(1);

      service.setItem('counter', 2);
      expect(counter()).toBe(2);
    });

    it('watch cleans up on destroy', () => {
      const service = new LynxSessionStorageService();
      const { injector, destroyCallbacks } = createMockInjector();

      const counter = service.watch<number>('counter', { injector });
      service.setItem('counter', 1);
      expect(counter()).toBe(1);

      destroyCallbacks.forEach((cb) => cb());

      service.setItem('counter', 99);
      // Signal should no longer update after destroy.
      expect(counter()).toBe(1);
    });
  });

  describe('when lynx is defined with session storage', () => {
    let setSessionStorageItemMock: ReturnType<typeof vi.fn>;
    let getSessionStorageItemMock: ReturnType<typeof vi.fn>;
    let subscribeSessionStorageMock: ReturnType<typeof vi.fn>;
    let unsubscribeSessionStorageMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      setSessionStorageItemMock = vi.fn();
      getSessionStorageItemMock = vi.fn();
      subscribeSessionStorageMock = vi.fn().mockReturnValue(42);
      unsubscribeSessionStorageMock = vi.fn();
      (globalThis as any).lynx = {
        setSessionStorageItem: setSessionStorageItemMock,
        getSessionStorageItem: getSessionStorageItemMock,
        subscribeSessionStorage: subscribeSessionStorageMock,
        unsubscribeSessionStorage: unsubscribeSessionStorageMock,
      };
    });

    it('setItem calls lynx.setSessionStorageItem', () => {
      const service = new LynxSessionStorageService();

      service.setItem('theme', { mode: 'dark' });

      expect(setSessionStorageItemMock).toHaveBeenCalledWith('theme', {
        mode: 'dark',
      });
    });

    it('getItem resolves with the value from the callback', async () => {
      getSessionStorageItemMock.mockImplementation(
        (key: string, cb: (value: unknown) => void) => {
          cb({ mode: 'light' });
        },
      );
      const service = new LynxSessionStorageService();

      const result = await service.getItem('theme');

      expect(result).toEqual({ mode: 'light' });
    });

    it('getItem passes the correct key', async () => {
      getSessionStorageItemMock.mockImplementation(
        (_key: string, cb: (value: unknown) => void) => cb(null),
      );
      const service = new LynxSessionStorageService();

      await service.getItem('myKey');

      expect(getSessionStorageItemMock).toHaveBeenCalledWith(
        'myKey',
        expect.any(Function),
      );
    });

    it('subscribe calls lynx.subscribeSessionStorage', () => {
      const service = new LynxSessionStorageService();
      const callback = vi.fn();

      service.subscribe('key', callback);

      expect(subscribeSessionStorageMock).toHaveBeenCalledWith('key', callback);
    });

    it('subscribe returns a subscription with the listener ID', () => {
      const service = new LynxSessionStorageService();

      const sub = service.subscribe('key', vi.fn());

      expect(sub).toEqual({ key: 'key', listenerId: 42 });
    });

    it('unsubscribe calls lynx.unsubscribeSessionStorage', () => {
      const service = new LynxSessionStorageService();

      service.unsubscribe({ key: 'theme', listenerId: 7 });

      expect(unsubscribeSessionStorageMock).toHaveBeenCalledWith('theme', 7);
    });

    describe('watch', () => {
      let injector: EnvironmentInjector;
      let destroyCallbacks: (() => void)[];

      beforeEach(() => {
        ({ injector, destroyCallbacks } = createMockInjector());
      });

      it('returns a signal seeded with undefined', () => {
        getSessionStorageItemMock.mockImplementation(() => {});
        const service = new LynxSessionStorageService();

        const value = service.watch('key', { injector });

        expect(value()).toBeUndefined();
      });

      it('seeds the signal with the current value after async resolution', async () => {
        getSessionStorageItemMock.mockImplementation(
          (_key: string, cb: (value: unknown) => void) => cb({ count: 5 }),
        );
        const service = new LynxSessionStorageService();

        const value = service.watch<{ count: number }>('counter', {
          injector,
        });
        await Promise.resolve();

        expect(value()).toEqual({ count: 5 });
      });

      it('subscribes to future changes for the key', () => {
        getSessionStorageItemMock.mockImplementation(() => {});
        const service = new LynxSessionStorageService();

        service.watch('theme', { injector });

        expect(subscribeSessionStorageMock).toHaveBeenCalledWith(
          'theme',
          expect.any(Function),
        );
      });

      it('updates the signal when the subscription callback fires', () => {
        getSessionStorageItemMock.mockImplementation(() => {});
        const service = new LynxSessionStorageService();

        const value = service.watch<string>('theme', { injector });
        const callback = subscribeSessionStorageMock.mock.calls[0][1] as (
          v: unknown,
        ) => void;
        callback('dark');

        expect(value()).toBe('dark');
      });

      it('unsubscribes when destroy is triggered', () => {
        getSessionStorageItemMock.mockImplementation(() => {});
        const service = new LynxSessionStorageService();

        service.watch('key', { injector });
        destroyCallbacks.forEach((cb) => cb());

        expect(unsubscribeSessionStorageMock).toHaveBeenCalledWith('key', 42);
      });
    });
  });
});

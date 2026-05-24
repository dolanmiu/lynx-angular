import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LynxFontService } from './font.service';

describe('LynxFontService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('when lynx is unavailable', () => {
    it('addFont() returns a rejected promise', async () => {
      const service = new LynxFontService();
      await expect(
        service.addFont({ fontFamily: 'Test', src: '/font.ttf' }),
      ).rejects.toThrow('lynx.addFont is not available');
    });

    it('fonts signal is an empty map', () => {
      const service = new LynxFontService();
      expect(service.fonts().size).toBe(0);
    });

    it('loadedFamilies is an empty set', () => {
      const service = new LynxFontService();
      expect(service.loadedFamilies().size).toBe(0);
    });
  });

  describe('when lynx is available', () => {
    let addFontMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      addFontMock = vi.fn();
      vi.stubGlobal('lynx', { addFont: addFontMock });
    });

    it('calls lynx.addFont with the native wire format', () => {
      const service = new LynxFontService();
      service.addFont({
        fontFamily: 'Roboto',
        src: 'https://example.com/roboto.ttf',
      });

      expect(addFontMock).toHaveBeenCalledWith(
        { 'font-family': 'Roboto', src: 'https://example.com/roboto.ttf' },
        expect.any(Function),
      );
    });

    it('resolves on successful callback', async () => {
      addFontMock.mockImplementation((_font: any, cb: any) => cb());
      const service = new LynxFontService();

      await expect(
        service.addFont({ fontFamily: 'Roboto', src: '/roboto.ttf' }),
      ).resolves.toBeUndefined();
    });

    it('rejects when callback receives an error', async () => {
      const err = new Error('Font load failed');
      addFontMock.mockImplementation((_font: any, cb: any) => cb(err));
      const service = new LynxFontService();

      await expect(
        service.addFont({ fontFamily: 'Roboto', src: '/roboto.ttf' }),
      ).rejects.toBe(err);
    });

    it('updates fonts signal to "loaded" on success', async () => {
      addFontMock.mockImplementation((_font: any, cb: any) => cb());
      const service = new LynxFontService();

      await service.addFont({ fontFamily: 'Roboto', src: '/r.ttf' });

      const entry = service.fonts().get('Roboto');
      expect(entry?.status).toBe('loaded');
      expect(entry?.fontFamily).toBe('Roboto');
      expect(entry?.src).toBe('/r.ttf');
    });

    it('updates fonts signal to "error" on failure', async () => {
      const err = new Error('fail');
      addFontMock.mockImplementation((_font: any, cb: any) => cb(err));
      const service = new LynxFontService();

      await service
        .addFont({ fontFamily: 'Bad', src: '/bad.ttf' })
        .catch(() => {});

      const entry = service.fonts().get('Bad');
      expect(entry?.status).toBe('error');
      expect(entry?.error).toBe(err);
    });

    it('loadedFamilies reflects successfully loaded fonts', async () => {
      addFontMock.mockImplementation((_font: any, cb: any) => cb());
      const service = new LynxFontService();

      await service.addFont({ fontFamily: 'A', src: '/a.ttf' });
      await service.addFont({ fontFamily: 'B', src: '/b.ttf' });

      expect(service.loadedFamilies()).toEqual(new Set(['A', 'B']));
    });

    it('deduplicates concurrent requests for the same font-family', () => {
      // Never calls callback — simulates in-flight request
      addFontMock.mockImplementation(() => {});
      const service = new LynxFontService();

      const p1 = service.addFont({ fontFamily: 'Dup', src: '/dup.ttf' });
      const p2 = service.addFont({ fontFamily: 'Dup', src: '/dup.ttf' });

      expect(p1).toBe(p2);
      expect(addFontMock).toHaveBeenCalledTimes(1);
    });

    it('returns immediately for already-loaded fonts', async () => {
      addFontMock.mockImplementation((_font: any, cb: any) => cb());
      const service = new LynxFontService();

      await service.addFont({ fontFamily: 'Loaded', src: '/l.ttf' });
      addFontMock.mockClear();

      await service.addFont({ fontFamily: 'Loaded', src: '/l.ttf' });
      expect(addFontMock).not.toHaveBeenCalled();
    });

    it('isLoaded() returns correct boolean', async () => {
      addFontMock.mockImplementation((_font: any, cb: any) => cb());
      const service = new LynxFontService();

      expect(service.isLoaded('X')).toBe(false);
      await service.addFont({ fontFamily: 'X', src: '/x.ttf' });
      expect(service.isLoaded('X')).toBe(true);
    });

    it('getStatus() returns correct status', async () => {
      addFontMock.mockImplementation((_font: any, cb: any) => cb());
      const service = new LynxFontService();

      expect(service.getStatus('Y')).toBe('idle');
      await service.addFont({ fontFamily: 'Y', src: '/y.ttf' });
      expect(service.getStatus('Y')).toBe('loaded');
    });
  });
});

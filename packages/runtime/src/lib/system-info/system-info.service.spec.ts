import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LynxSystemInfoService } from './system-info.service';

describe('LynxSystemInfoService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('when SystemInfo is unavailable', () => {
    it('constructor throws', () => {
      expect(() => new LynxSystemInfoService()).toThrow(
        'SystemInfo is not available',
      );
    });
  });

  describe('when SystemInfo is available', () => {
    const mockSystemInfo = {
      engineVersion: '3.2',
      lynxSdkVersion: '3.2',
      osVersion: '18.0',
      pixelWidth: 1170,
      pixelHeight: 2532,
      pixelRatio: 3,
      platform: 'iOS' as const,
      runtimeType: 'jsc' as const,
      theme: { mode: 'light' },
    };

    beforeEach(() => {
      vi.stubGlobal('SystemInfo', mockSystemInfo);
    });

    it('exposes platform', () => {
      const service = new LynxSystemInfoService();
      expect(service.platform).toBe('iOS');
    });

    it('exposes engineVersion', () => {
      const service = new LynxSystemInfoService();
      expect(service.engineVersion).toBe('3.2');
    });

    it('exposes osVersion', () => {
      const service = new LynxSystemInfoService();
      expect(service.osVersion).toBe('18.0');
    });

    it('exposes pixelWidth', () => {
      const service = new LynxSystemInfoService();
      expect(service.pixelWidth).toBe(1170);
    });

    it('exposes pixelHeight', () => {
      const service = new LynxSystemInfoService();
      expect(service.pixelHeight).toBe(2532);
    });

    it('exposes pixelRatio', () => {
      const service = new LynxSystemInfoService();
      expect(service.pixelRatio).toBe(3);
    });

    it('exposes runtimeType', () => {
      const service = new LynxSystemInfoService();
      expect(service.runtimeType).toBe('jsc');
    });

    it('computes screenWidth as pixelWidth / pixelRatio', () => {
      const service = new LynxSystemInfoService();
      expect(service.screenWidth).toBe(390);
    });

    it('computes screenHeight as pixelHeight / pixelRatio', () => {
      const service = new LynxSystemInfoService();
      expect(service.screenHeight).toBe(844);
    });

    it('exposes theme object', () => {
      const service = new LynxSystemInfoService();
      expect(service.theme).toEqual({ mode: 'light' });
    });

    it('returns undefined theme when not provided', () => {
      vi.stubGlobal('SystemInfo', { ...mockSystemInfo, theme: undefined });
      const service = new LynxSystemInfoService();
      expect(service.theme).toBeUndefined();
    });
  });
});

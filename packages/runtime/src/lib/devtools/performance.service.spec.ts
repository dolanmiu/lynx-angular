import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LynxPerformanceService } from './performance.service';

describe('LynxPerformanceService', () => {
  afterEach(() => {
    delete (globalThis as any).lynx;
  });

  describe('when lynx.performance is unavailable', () => {
    it('does not throw on construction', () => {
      expect(() => new LynxPerformanceService()).not.toThrow();
    });

    it('isRecording returns false', () => {
      const service = new LynxPerformanceService();
      expect(service.isRecording()).toBe(false);
    });

    it('profileStart is a no-op', () => {
      const service = new LynxPerformanceService();
      expect(() => service.profileStart('test')).not.toThrow();
    });

    it('profileEnd is a no-op', () => {
      const service = new LynxPerformanceService();
      expect(() => service.profileEnd()).not.toThrow();
    });

    it('profileMark is a no-op', () => {
      const service = new LynxPerformanceService();
      expect(() => service.profileMark('test')).not.toThrow();
    });

    it('profileFlowId returns 0', () => {
      const service = new LynxPerformanceService();
      expect(service.profileFlowId()).toBe(0);
    });
  });

  describe('when lynx.performance is available', () => {
    let mockPerf: {
      profileStart: ReturnType<typeof vi.fn>;
      profileEnd: ReturnType<typeof vi.fn>;
      profileMark: ReturnType<typeof vi.fn>;
      profileFlowId: ReturnType<typeof vi.fn>;
      isProfileRecording: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
      mockPerf = {
        profileStart: vi.fn(),
        profileEnd: vi.fn(),
        profileMark: vi.fn(),
        profileFlowId: vi.fn().mockReturnValue(42),
        isProfileRecording: vi.fn().mockReturnValue(true),
      };
      (globalThis as any).lynx = { performance: mockPerf };
    });

    it('isRecording delegates to isProfileRecording', () => {
      const service = new LynxPerformanceService();
      expect(service.isRecording()).toBe(true);

      mockPerf.isProfileRecording.mockReturnValue(false);
      expect(service.isRecording()).toBe(false);
    });

    it('profileStart calls lynx.performance.profileStart', () => {
      const service = new LynxPerformanceService();
      service.profileStart('MyTrace', { flowId: 1, args: { x: 10 } });

      expect(mockPerf.profileStart).toHaveBeenCalledWith('MyTrace', {
        flowId: 1,
        args: { x: 10 },
      });
    });

    it('profileEnd calls lynx.performance.profileEnd', () => {
      const service = new LynxPerformanceService();
      service.profileEnd();

      expect(mockPerf.profileEnd).toHaveBeenCalled();
    });

    it('profileMark calls lynx.performance.profileMark', () => {
      const service = new LynxPerformanceService();
      service.profileMark('loaded', { args: { source: 'cache' } });

      expect(mockPerf.profileMark).toHaveBeenCalledWith('loaded', {
        args: { source: 'cache' },
      });
    });

    it('profileFlowId returns generated ID', () => {
      const service = new LynxPerformanceService();
      expect(service.profileFlowId()).toBe(42);
    });
  });
});

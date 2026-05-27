import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LynxExposureService } from './exposure.service';

describe('LynxExposureService', () => {
  afterEach(() => {
    delete (globalThis as any).lynx;
  });

  describe('when lynx is not defined', () => {
    it('initializes exposures to an empty array', () => {
      const service = new LynxExposureService();

      expect(service.exposures()).toEqual([]);
    });

    it('initializes disexposures to an empty array', () => {
      const service = new LynxExposureService();

      expect(service.disexposures()).toEqual([]);
    });

    it('initializes active to true', () => {
      const service = new LynxExposureService();

      expect(service.active()).toBe(true);
    });

    it('does not throw when constructing without a lynx global', () => {
      expect(() => new LynxExposureService()).not.toThrow();
    });

    it('does not throw when calling stopExposure', () => {
      const service = new LynxExposureService();

      expect(() => service.stopExposure()).not.toThrow();
    });

    it('does not throw when calling resumeExposure', () => {
      const service = new LynxExposureService();

      expect(() => service.resumeExposure()).not.toThrow();
    });

    it('does not throw when calling setObserverFrameRate', () => {
      const service = new LynxExposureService();

      expect(() => service.setObserverFrameRate()).not.toThrow();
    });
  });

  describe('when lynx is defined', () => {
    let addListener: ReturnType<typeof vi.fn>;
    let getJSModule: ReturnType<typeof vi.fn>;
    let stopExposureMock: ReturnType<typeof vi.fn>;
    let resumeExposureMock: ReturnType<typeof vi.fn>;
    let setObserverFrameRateMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      addListener = vi.fn();
      getJSModule = vi.fn().mockReturnValue({ addListener });
      stopExposureMock = vi.fn();
      resumeExposureMock = vi.fn();
      setObserverFrameRateMock = vi.fn();
      (globalThis as any).lynx = {
        getJSModule,
        stopExposure: stopExposureMock,
        resumeExposure: resumeExposureMock,
        setObserverFrameRate: setObserverFrameRateMock,
      };
    });

    it('calls getJSModule with "GlobalEventEmitter"', () => {
      new LynxExposureService();

      expect(getJSModule).toHaveBeenCalledWith('GlobalEventEmitter');
    });

    it('registers a listener for the "exposure" event', () => {
      new LynxExposureService();

      expect(addListener).toHaveBeenCalledWith(
        'exposure',
        expect.any(Function),
      );
    });

    it('registers a listener for the "disexposure" event', () => {
      new LynxExposureService();

      expect(addListener).toHaveBeenCalledWith(
        'disexposure',
        expect.any(Function),
      );
    });

    it('updates exposures signal when the exposure listener fires', () => {
      const service = new LynxExposureService();
      const exposureListener = addListener.mock.calls.find(
        (c: unknown[]) => c[0] === 'exposure',
      )![1] as (...args: unknown[]) => void;
      const batch = [{ 'exposure-id': 'a', 'exposure-scene': 's1' }];

      exposureListener(batch);

      expect(service.exposures()).toEqual(batch);
    });

    it('updates disexposures signal when the disexposure listener fires', () => {
      const service = new LynxExposureService();
      const disexposureListener = addListener.mock.calls.find(
        (c: unknown[]) => c[0] === 'disexposure',
      )![1] as (...args: unknown[]) => void;
      const batch = [{ 'exposure-id': 'b', 'exposure-scene': 's2' }];

      disexposureListener(batch);

      expect(service.disexposures()).toEqual(batch);
    });

    it('replaces exposures entirely on each successive update', () => {
      const service = new LynxExposureService();
      const listener = addListener.mock.calls.find(
        (c: unknown[]) => c[0] === 'exposure',
      )![1] as (...args: unknown[]) => void;

      listener([{ 'exposure-id': 'a' }]);
      listener([{ 'exposure-id': 'b' }]);

      expect(service.exposures()).toEqual([{ 'exposure-id': 'b' }]);
    });

    it('stopExposure calls lynx.stopExposure with options', () => {
      const service = new LynxExposureService();

      service.stopExposure({ sendEvent: true });

      expect(stopExposureMock).toHaveBeenCalledWith({ sendEvent: true });
    });

    it('stopExposure sets active to false', () => {
      const service = new LynxExposureService();

      service.stopExposure();

      expect(service.active()).toBe(false);
    });

    it('resumeExposure calls lynx.resumeExposure', () => {
      const service = new LynxExposureService();

      service.resumeExposure();

      expect(resumeExposureMock).toHaveBeenCalledOnce();
    });

    it('resumeExposure sets active to true', () => {
      const service = new LynxExposureService();
      service.stopExposure();

      service.resumeExposure();

      expect(service.active()).toBe(true);
    });

    it('setObserverFrameRate calls lynx.setObserverFrameRate with options', () => {
      const service = new LynxExposureService();

      service.setObserverFrameRate({ forExposureCheck: 30 });

      expect(setObserverFrameRateMock).toHaveBeenCalledWith({
        forExposureCheck: 30,
      });
    });
  });
});

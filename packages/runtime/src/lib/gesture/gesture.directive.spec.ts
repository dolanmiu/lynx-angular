import type { SimpleChanges } from '@angular/core';
import { ElementRef, Injector, runInInjectionContext } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LynxGestureDetector } from './gesture.directive';
import { Gesture } from './composition';
import { TapGesture } from './tap-gesture';
import { PanGesture } from './pan-gesture';
import { GestureType } from './types';

// Builds a directive instance with a fake element injected via DI.
const createDirective = (nativeElement: object): LynxGestureDetector => {
  const injector = Injector.create({
    providers: [
      { provide: ElementRef, useValue: new ElementRef(nativeElement) },
    ],
  });
  return runInInjectionContext(injector, () => new LynxGestureDetector());
};

// Simulates Angular's change detection call after an input is set.
const applyGesture = (
  directive: LynxGestureDetector,
  gesture: LynxGestureDetector['lynxGesture'],
): void => {
  directive.lynxGesture = gesture;
  directive.ngOnChanges({} as SimpleChanges);
};

describe('LynxGestureDetector', () => {
  const fakeRef = { _isRef: true };
  let nativeEl: { element: typeof fakeRef };
  let setGestureDetector: ReturnType<typeof vi.fn>;
  let removeGestureDetector: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    nativeEl = { element: fakeRef };
    setGestureDetector = vi.fn();
    removeGestureDetector = vi.fn();
    (globalThis as any).__SetGestureDetector = setGestureDetector;
    (globalThis as any).__RemoveGestureDetector = removeGestureDetector;
  });

  afterEach(() => {
    delete (globalThis as any).__SetGestureDetector;
    delete (globalThis as any).__RemoveGestureDetector;
  });

  describe('resolving gestures', () => {
    it('attaches a single gesture passed directly', () => {
      const g = new TapGesture();
      const directive = createDirective(nativeEl);

      applyGesture(directive, g);

      expect(setGestureDetector).toHaveBeenCalledOnce();
      expect(setGestureDetector).toHaveBeenCalledWith(
        fakeRef,
        g.id,
        GestureType.TAP,
        expect.any(Object),
        expect.any(Object),
      );
    });

    it('attaches all gestures passed as an array', () => {
      const g1 = new TapGesture();
      const g2 = new PanGesture();
      const directive = createDirective(nativeEl);

      applyGesture(directive, [g1, g2]);

      expect(setGestureDetector).toHaveBeenCalledTimes(2);
      expect(setGestureDetector).toHaveBeenCalledWith(
        fakeRef,
        g1.id,
        GestureType.TAP,
        expect.any(Object),
        expect.any(Object),
      );
      expect(setGestureDetector).toHaveBeenCalledWith(
        fakeRef,
        g2.id,
        GestureType.PAN,
        expect.any(Object),
        expect.any(Object),
      );
    });

    it('attaches all gestures from a ComposedGesture', () => {
      const g1 = new TapGesture();
      const g2 = new PanGesture();
      const composed = Gesture.Race(g1, g2);
      const directive = createDirective(nativeEl);

      applyGesture(directive, composed);

      expect(setGestureDetector).toHaveBeenCalledTimes(2);
    });

    it('attaches nothing when lynxGesture is falsy', () => {
      const directive = createDirective(nativeEl);

      directive.lynxGesture = null as any;
      directive.ngOnChanges({} as SimpleChanges);

      expect(setGestureDetector).not.toHaveBeenCalled();
    });
  });

  describe('ngOnChanges', () => {
    it('passes the gesture type to __SetGestureDetector', () => {
      const g = new PanGesture();
      const directive = createDirective(nativeEl);

      applyGesture(directive, g);

      const [, , type] = setGestureDetector.mock.calls[0];
      expect(type).toBe(GestureType.PAN);
    });

    it('passes callbacks in the config object', () => {
      const g = new TapGesture();
      const cb = vi.fn();
      g.onBegin(cb);
      const directive = createDirective(nativeEl);

      applyGesture(directive, g);

      const [, , , config] = setGestureDetector.mock.calls[0];
      expect(config.callbacks).toHaveLength(1);
      expect(config.callbacks[0].name).toBe('onBegin');
    });

    it('wraps each callback with a GestureStateManager', () => {
      const g = new TapGesture();
      const cb = vi.fn();
      g.onBegin(cb);
      const directive = createDirective(nativeEl);

      applyGesture(directive, g);

      const [, , , config] = setGestureDetector.mock.calls[0];
      const event = { state: 1, absoluteX: 0, absoluteY: 0 };
      config.callbacks[0].callback(event);

      // The original callback receives (event, stateManager)
      expect(cb).toHaveBeenCalledWith(event, expect.any(Object));
    });

    it('passes undefined for config when gesture has no config', () => {
      const g = new TapGesture();
      const directive = createDirective(nativeEl);

      applyGesture(directive, g);

      const [, , , config] = setGestureDetector.mock.calls[0];
      expect(config.config).toBeUndefined();
    });

    it('passes the config object when gesture has config values', () => {
      const g = new TapGesture().numberOfTaps(2);
      const directive = createDirective(nativeEl);

      applyGesture(directive, g);

      const [, , , config] = setGestureDetector.mock.calls[0];
      expect(config.config).toEqual({ numberOfTaps: 2 });
    });

    it('passes relation map IDs derived from waitFor, simultaneousWith, continueWith', () => {
      const g1 = new TapGesture();
      const g2 = new PanGesture();
      g1.waitFor(g2);
      const directive = createDirective(nativeEl);

      applyGesture(directive, g1);

      const [, , , , relationMap] = setGestureDetector.mock.calls[0];
      expect(relationMap.waitFor).toEqual([g2.id]);
      expect(relationMap.simultaneous).toEqual([]);
      expect(relationMap.continueWith).toEqual([]);
    });

    it('detaches old gestures before attaching new ones on subsequent changes', () => {
      const g1 = new TapGesture();
      const g2 = new PanGesture();
      const directive = createDirective(nativeEl);

      applyGesture(directive, g1);
      applyGesture(directive, g2);

      // g1 should have been removed before g2 was attached
      expect(removeGestureDetector).toHaveBeenCalledWith(fakeRef, g1.id);
      expect(setGestureDetector).toHaveBeenCalledTimes(2);
    });
  });

  describe('ngOnDestroy', () => {
    it('removes all attached gesture detectors', () => {
      const g1 = new TapGesture();
      const g2 = new PanGesture();
      const directive = createDirective(nativeEl);

      applyGesture(directive, [g1, g2]);
      directive.ngOnDestroy();

      expect(removeGestureDetector).toHaveBeenCalledWith(fakeRef, g1.id);
      expect(removeGestureDetector).toHaveBeenCalledWith(fakeRef, g2.id);
    });

    it('clears the attached ID list so a second destroy is a no-op', () => {
      const g = new TapGesture();
      const directive = createDirective(nativeEl);

      applyGesture(directive, g);
      directive.ngOnDestroy();
      directive.ngOnDestroy();

      // Only called once — the second destroy has nothing to remove.
      expect(removeGestureDetector).toHaveBeenCalledTimes(1);
    });

    it('does not throw when __RemoveGestureDetector throws (element already destroyed)', () => {
      removeGestureDetector.mockImplementation(() => {
        throw new Error('native element gone');
      });
      const g = new TapGesture();
      const directive = createDirective(nativeEl);

      applyGesture(directive, g);

      expect(() => directive.ngOnDestroy()).not.toThrow();
    });
  });

  describe('missing element reference', () => {
    it('skips attachment when nativeElement has no .element property', () => {
      // nativeElement without .element — directive will skip the attach.
      const directive = createDirective({});
      const g = new TapGesture();

      applyGesture(directive, g);

      expect(setGestureDetector).not.toHaveBeenCalled();
    });

    it('skips detach in ngOnDestroy when nativeElement has no .element property', () => {
      const directive = createDirective({});
      const g = new TapGesture();

      applyGesture(directive, g);

      expect(() => directive.ngOnDestroy()).not.toThrow();
      expect(removeGestureDetector).not.toHaveBeenCalled();
    });
  });
});

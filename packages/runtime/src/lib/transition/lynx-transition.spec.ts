// @vitest-environment jsdom
import '@angular/compiler';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { LynxTransition } from './lynx-transition';

/**
 * Sets an Angular InputSignal's value using Angular's internal reactive node API.
 * Needed because JIT mode doesn't wire up signal inputs for template binding or setInput().
 */
const setInputSignal = (signalFn: any, value: any): void => {
  const symbols = Object.getOwnPropertySymbols(signalFn);
  const signalSymbol = symbols.find((s) => s.toString() === 'Symbol(SIGNAL)')!;
  const node = signalFn[signalSymbol];
  const proto = Object.getPrototypeOf(node);
  proto.applyValueToInputSignal(node, value);
};

describe('LynxTransition', () => {
  let rAFCallbacks: (() => void)[];

  beforeAll(() => {
    TestBed.initTestEnvironment(
      BrowserDynamicTestingModule,
      platformBrowserDynamicTesting(),
    );
  });

  beforeEach(() => {
    rAFCallbacks = [];

    vi.useFakeTimers();

    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((cb: () => void) => {
        rAFCallbacks.push(cb);
        return rAFCallbacks.length;
      }),
    );
    vi.stubGlobal(
      'cancelAnimationFrame',
      vi.fn((id: number) => {
        if (id > 0 && id <= rAFCallbacks.length)
          rAFCallbacks[id - 1] = () => {};
      }),
    );

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [LynxTransition],
      providers: [provideZonelessChangeDetection()],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const flushFrame = () => {
    const cbs = [...rAFCallbacks];
    rAFCallbacks.length = 0;
    cbs.forEach((cb) => cb());
  };

  /**
   * Creates the component and runs the initial effect (show=false → shouldRender=false).
   */
  const create = () => {
    const fixture = TestBed.createComponent(LynxTransition);
    fixture.detectChanges();
    return fixture;
  };

  /**
   * Triggers enter by setting show=true after initialization.
   */
  const triggerEnter = (fixture: any) => {
    setInputSignal(fixture.componentInstance.show, true);
    TestBed.flushEffects();
  };

  /**
   * Starts with show=true (initial render), then triggers leave.
   */
  const createShowing = () => {
    const fixture = TestBed.createComponent(LynxTransition);
    // Set show=true BEFORE first detectChanges so the initial effect
    // initializes with shouldRender=true (no animation).
    setInputSignal(fixture.componentInstance.show, true);
    fixture.detectChanges();
    return fixture;
  };

  const triggerLeave = (fixture: any) => {
    setInputSignal(fixture.componentInstance.show, false);
    TestBed.flushEffects();
  };

  describe('enter()', () => {
    it('results in enter-from and enter-active classes present', () => {
      const fixture = create();
      triggerEnter(fixture);

      const el = fixture.nativeElement as HTMLElement;
      expect(el.classList.contains('v-enter-from')).toBe(true);
      expect(el.classList.contains('v-enter-active')).toBe(true);
    });

    it('sets shouldRender to true', () => {
      const fixture = create();
      triggerEnter(fixture);

      expect(fixture.componentInstance.shouldRender()).toBe(true);
    });

    it('on next frame: has enter-to and enter-active, no enter-from', () => {
      const fixture = create();
      triggerEnter(fixture);
      flushFrame();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.classList.contains('v-enter-active')).toBe(true);
      expect(el.classList.contains('v-enter-to')).toBe(true);
      expect(el.classList.contains('v-enter-from')).toBe(false);
    });

    it('after duration: all enter classes removed', () => {
      const fixture = create();
      triggerEnter(fixture);
      flushFrame();
      vi.advanceTimersByTime(300);

      const el = fixture.nativeElement as HTMLElement;
      expect(el.classList.contains('v-enter-active')).toBe(false);
      expect(el.classList.contains('v-enter-to')).toBe(false);
      expect(el.classList.contains('v-enter-from')).toBe(false);
    });
  });

  describe('leave()', () => {
    it('results in leave-from and leave-active classes present', () => {
      const fixture = createShowing();
      triggerLeave(fixture);

      const el = fixture.nativeElement as HTMLElement;
      expect(el.classList.contains('v-leave-from')).toBe(true);
      expect(el.classList.contains('v-leave-active')).toBe(true);
    });

    it('on next frame: has leave-to and leave-active, no leave-from', () => {
      const fixture = createShowing();
      triggerLeave(fixture);
      flushFrame();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.classList.contains('v-leave-active')).toBe(true);
      expect(el.classList.contains('v-leave-to')).toBe(true);
      expect(el.classList.contains('v-leave-from')).toBe(false);
    });

    it('after duration: sets shouldRender false and all leave classes removed', () => {
      const fixture = createShowing();
      triggerLeave(fixture);
      flushFrame();
      vi.advanceTimersByTime(300);

      const el = fixture.nativeElement as HTMLElement;
      expect(fixture.componentInstance.shouldRender()).toBe(false);
      expect(el.classList.contains('v-leave-active')).toBe(false);
      expect(el.classList.contains('v-leave-to')).toBe(false);
      expect(el.classList.contains('v-leave-from')).toBe(false);
    });
  });

  describe('cancellation', () => {
    it('enter cancels in-progress leave', () => {
      const fixture = createShowing();
      triggerLeave(fixture);
      triggerEnter(fixture);

      const el = fixture.nativeElement as HTMLElement;
      expect(el.classList.contains('v-leave-from')).toBe(false);
      expect(el.classList.contains('v-leave-active')).toBe(false);
      expect(el.classList.contains('v-enter-from')).toBe(true);
      expect(el.classList.contains('v-enter-active')).toBe(true);
    });

    it('leave cancels in-progress enter', () => {
      const fixture = create();
      triggerEnter(fixture);
      triggerLeave(fixture);

      const el = fixture.nativeElement as HTMLElement;
      expect(el.classList.contains('v-enter-from')).toBe(false);
      expect(el.classList.contains('v-enter-active')).toBe(false);
      expect(el.classList.contains('v-leave-from')).toBe(true);
      expect(el.classList.contains('v-leave-active')).toBe(true);
    });

    it('cancelled leave timer does not fire', () => {
      const fixture = createShowing();
      triggerLeave(fixture);
      flushFrame();

      triggerEnter(fixture);
      vi.advanceTimersByTime(500);

      expect(fixture.componentInstance.shouldRender()).toBe(true);
    });
  });
});

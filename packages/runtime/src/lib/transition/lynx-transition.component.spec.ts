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
import { LynxTransition } from './lynx-transition.component';

type ClassOp = { op: 'add' | 'remove'; cls: string };

describe('LynxTransition', () => {
  let ops: ClassOp[];
  let rAFCallbacks: (() => void)[];

  beforeAll(() => {
    TestBed.initTestEnvironment(
      BrowserDynamicTestingModule,
      platformBrowserDynamicTesting(),
    );
  });

  beforeEach(() => {
    ops = [];
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

  const currentClasses = (): Set<string> => {
    const classes = new Set<string>();
    for (const { op, cls } of ops) {
      if (op === 'add') classes.add(cls);
      else classes.delete(cls);
    }
    return classes;
  };

  const create = () => {
    const fixture = TestBed.createComponent(LynxTransition);
    fixture.detectChanges();
    const c = fixture.componentInstance;

    // Spy on the renderer that Angular injected.
    const renderer = (c as any).renderer;
    const origAdd = renderer.addClass.bind(renderer);
    const origRemove = renderer.removeClass.bind(renderer);
    renderer.addClass = (el: any, cls: string) => {
      ops.push({ op: 'add', cls });
      origAdd(el, cls);
    };
    renderer.removeClass = (el: any, cls: string) => {
      ops.push({ op: 'remove', cls });
      origRemove(el, cls);
    };
    return c;
  };

  describe('enter()', () => {
    it('results in enter-from and enter-active classes present', () => {
      const c = create();
      (c as any).enter();

      expect(currentClasses()).toContain('v-enter-from');
      expect(currentClasses()).toContain('v-enter-active');
    });

    it('sets shouldRender to true', () => {
      const c = create();
      (c as any).enter();

      expect(c.shouldRender()).toBe(true);
    });

    it('on next frame: has enter-to and enter-active, no enter-from', () => {
      const c = create();
      (c as any).enter();
      flushFrame();

      expect(currentClasses()).toContain('v-enter-active');
      expect(currentClasses()).toContain('v-enter-to');
      expect(currentClasses()).not.toContain('v-enter-from');
    });

    it('after duration: all enter classes removed', () => {
      const c = create();
      (c as any).enter();
      flushFrame();
      vi.advanceTimersByTime(300);

      expect(currentClasses()).not.toContain('v-enter-active');
      expect(currentClasses()).not.toContain('v-enter-to');
      expect(currentClasses()).not.toContain('v-enter-from');
    });
  });

  describe('leave()', () => {
    it('results in leave-from and leave-active classes present', () => {
      const c = create();
      c.shouldRender.set(true);
      (c as any).leave();

      expect(currentClasses()).toContain('v-leave-from');
      expect(currentClasses()).toContain('v-leave-active');
    });

    it('on next frame: has leave-to and leave-active, no leave-from', () => {
      const c = create();
      c.shouldRender.set(true);
      (c as any).leave();
      flushFrame();

      expect(currentClasses()).toContain('v-leave-active');
      expect(currentClasses()).toContain('v-leave-to');
      expect(currentClasses()).not.toContain('v-leave-from');
    });

    it('after duration: sets shouldRender false and all leave classes removed', () => {
      const c = create();
      c.shouldRender.set(true);
      (c as any).leave();
      flushFrame();
      vi.advanceTimersByTime(300);

      expect(c.shouldRender()).toBe(false);
      expect(currentClasses()).not.toContain('v-leave-active');
      expect(currentClasses()).not.toContain('v-leave-to');
      expect(currentClasses()).not.toContain('v-leave-from');
    });
  });

  describe('cancellation', () => {
    it('enter cancels in-progress leave', () => {
      const c = create();
      c.shouldRender.set(true);
      (c as any).leave();
      ops.length = 0;

      (c as any).enter();

      expect(currentClasses()).not.toContain('v-leave-from');
      expect(currentClasses()).not.toContain('v-leave-active');
      expect(currentClasses()).toContain('v-enter-from');
      expect(currentClasses()).toContain('v-enter-active');
    });

    it('leave cancels in-progress enter', () => {
      const c = create();
      (c as any).enter();
      ops.length = 0;

      (c as any).leave();

      expect(currentClasses()).not.toContain('v-enter-from');
      expect(currentClasses()).not.toContain('v-enter-active');
      expect(currentClasses()).toContain('v-leave-from');
      expect(currentClasses()).toContain('v-leave-active');
    });

    it('cancelled leave timer does not fire', () => {
      const c = create();
      c.shouldRender.set(true);
      (c as any).leave();
      flushFrame();

      (c as any).enter();
      vi.advanceTimersByTime(500);

      expect(c.shouldRender()).toBe(true);
    });
  });
});

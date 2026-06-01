// @vitest-environment jsdom
import '@angular/compiler';
import {
  type EmbeddedViewRef,
  provideZonelessChangeDetection,
} from '@angular/core';
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
import { LynxTransitionGroup } from './lynx-transition-group.component';

type ClassOp = { op: 'add' | 'remove'; cls: string };

describe('LynxTransitionGroup', () => {
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
      imports: [LynxTransitionGroup],
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
    const fixture = TestBed.createComponent(LynxTransitionGroup);
    fixture.detectChanges();
    const c = fixture.componentInstance;

    // Spy on the injected renderer.
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

  // Helper: create a mock ViewEntry with a root DOM element.
  const mockEntry = (item: any = { id: 1 }) => {
    const rootEl = document.createElement('div');
    return {
      viewRef: { rootNodes: [rootEl] } as unknown as EmbeddedViewRef<any>,
      item,
      leaving: false,
      leaveRaf: null as number | null,
      leaveTimer: null as ReturnType<typeof setTimeout> | null,
    };
  };

  describe('animateEnter()', () => {
    it('adds enter-from and enter-active classes', () => {
      const c = create();
      const entry = mockEntry();
      (c as any).animateEnter(entry);

      expect(currentClasses()).toContain('v-enter-from');
      expect(currentClasses()).toContain('v-enter-active');
    });

    it('transitions to enter-to on next frame', () => {
      const c = create();
      const entry = mockEntry();
      (c as any).animateEnter(entry);
      flushFrame();

      expect(currentClasses()).toContain('v-enter-active');
      expect(currentClasses()).toContain('v-enter-to');
      expect(currentClasses()).not.toContain('v-enter-from');
    });

    it('cleans up all enter classes after duration', () => {
      const c = create();
      const entry = mockEntry();
      (c as any).animateEnter(entry);
      flushFrame();
      vi.advanceTimersByTime(300);

      expect(currentClasses()).not.toContain('v-enter-from');
      expect(currentClasses()).not.toContain('v-enter-active');
      expect(currentClasses()).not.toContain('v-enter-to');
    });
  });

  describe('animateLeave()', () => {
    it('adds leave-from and leave-active classes', () => {
      const c = create();
      const entry = mockEntry();
      (c as any).entries.set(1, entry);
      (c as any).animateLeave(1, entry);

      expect(entry.leaving).toBe(true);
      expect(currentClasses()).toContain('v-leave-from');
      expect(currentClasses()).toContain('v-leave-active');
    });

    it('transitions to leave-to on next frame', () => {
      const c = create();
      const entry = mockEntry();
      (c as any).entries.set(1, entry);
      (c as any).animateLeave(1, entry);
      flushFrame();

      expect(currentClasses()).toContain('v-leave-active');
      expect(currentClasses()).toContain('v-leave-to');
      expect(currentClasses()).not.toContain('v-leave-from');
    });

    it('removes entry from map after duration', () => {
      const c = create();
      const entry = mockEntry();
      (c as any).entries.set(1, entry);

      // Mock vcr so destroyEntry can call indexOf/remove.
      Object.defineProperty(c, 'vcr', {
        value: () => ({ indexOf: () => 0, remove: vi.fn() }),
      });

      (c as any).animateLeave(1, entry);
      flushFrame();
      vi.advanceTimersByTime(300);

      expect((c as any).entries.has(1)).toBe(false);
    });
  });

  describe('cancelLeave()', () => {
    it('cleans up leave classes and resets leaving flag', () => {
      const c = create();
      const entry = mockEntry();
      entry.leaving = true;
      (c as any).entries.set(1, entry);
      (c as any).animateLeave(1, entry);
      ops.length = 0;

      (c as any).cancelLeave(1, entry);

      expect(entry.leaving).toBe(false);
      expect(currentClasses()).not.toContain('v-leave-from');
      expect(currentClasses()).not.toContain('v-leave-active');
      expect(currentClasses()).not.toContain('v-leave-to');
    });

    it('prevents leave timer from firing', () => {
      const c = create();
      const entry = mockEntry();
      (c as any).entries.set(1, entry);
      (c as any).animateLeave(1, entry);
      flushFrame();

      (c as any).cancelLeave(1, entry);
      vi.advanceTimersByTime(500);

      // Entry should still exist (not destroyed by leave timer).
      expect((c as any).entries.has(1)).toBe(true);
    });
  });

  describe('reconcile()', () => {
    it('detects new items and calls animateEnter', () => {
      const c = create();
      const enterSpy = vi.fn();
      (c as any).animateEnter = enterSpy;

      // Provide a mock template that creates div elements.
      const mockTemplate = {} as any;
      Object.defineProperty(c, 'itemTemplate', {
        value: () => mockTemplate,
      });

      // Mock vcr to return a fake view ref.
      const mockVcr = {
        createEmbeddedView: vi.fn(() => ({
          rootNodes: [document.createElement('div')],
          context: { $implicit: null },
          markForCheck: vi.fn(),
        })),
        indexOf: vi.fn(() => 0),
        move: vi.fn(),
      };
      Object.defineProperty(c, 'vcr', { value: () => mockVcr });

      (c as any).reconcile([{ id: 1, name: 'A' }], (item: any) => item.id);

      expect(mockVcr.createEmbeddedView).toHaveBeenCalled();
      expect(enterSpy).toHaveBeenCalled();
    });

    it('detects removed items and calls animateLeave', () => {
      const c = create();
      const leaveSpy = vi.fn();
      (c as any).animateLeave = leaveSpy;

      // Pre-populate with an entry.
      const entry = mockEntry({ id: 1, name: 'A' });
      (c as any).entries.set(1, entry);

      // Provide a mock template.
      Object.defineProperty(c, 'itemTemplate', { value: () => ({}) });
      Object.defineProperty(c, 'vcr', {
        value: () => ({
          createEmbeddedView: vi.fn(),
          indexOf: vi.fn(() => 0),
          move: vi.fn(),
        }),
      });

      (c as any).reconcile([], (item: any) => item.id);

      expect(leaveSpy).toHaveBeenCalledWith(1, entry);
    });

    it('cancels leave when item reappears', () => {
      const c = create();
      const cancelSpy = vi.fn();
      (c as any).cancelLeave = cancelSpy;

      // Pre-populate with a leaving entry.
      const entry = mockEntry({ id: 1, name: 'A' });
      entry.leaving = true;
      (c as any).entries.set(1, entry);

      Object.defineProperty(c, 'itemTemplate', { value: () => ({}) });
      Object.defineProperty(c, 'vcr', {
        value: () => ({
          createEmbeddedView: vi.fn(),
          indexOf: vi.fn(() => 0),
          move: vi.fn(),
        }),
      });

      (c as any).reconcile([{ id: 1, name: 'A' }], (item: any) => item.id);

      expect(cancelSpy).toHaveBeenCalledWith(1, entry);
    });
  });
});

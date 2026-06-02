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
import { LynxTransitionGroup } from './lynx-transition-group.component';

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

type Item = { id: number; name: string };

describe('LynxTransitionGroup', () => {
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

  /**
   * Creates the component with mocked contentChild/viewChild queries.
   * JIT mode doesn't support signal-based content/view queries, so we override them
   * with mock implementations that create real DOM elements.
   */
  const create = () => {
    const fixture = TestBed.createComponent(LynxTransitionGroup<Item>);
    const comp = fixture.componentInstance;
    const hostEl = fixture.nativeElement as HTMLElement;

    const views: any[] = [];

    const mockTemplate = {
      createEmbeddedView: (context: any) => {
        const div = document.createElement('div');
        div.className = 'item';
        div.textContent = context?.$implicit?.name ?? '';
        return {
          rootNodes: [div],
          context,
          markForCheck: () => {},
          destroy: () => div.remove(),
          detectChanges: () => {},
        };
      },
    };

    const mockVcr = {
      createEmbeddedView: (tmpl: any, ctx: any) => {
        const view = tmpl.createEmbeddedView(ctx);
        views.push(view);
        hostEl.appendChild(view.rootNodes[0]);
        return view;
      },
      indexOf: (view: any) => views.indexOf(view),
      move: (_view: any, _index: number) => {},
      remove: (index: number) => {
        const view = views[index];
        if (view) {
          view.rootNodes[0].remove();
          views.splice(index, 1);
        }
      },
    };

    Object.defineProperty(comp, 'itemTemplate', {
      value: () => mockTemplate,
      writable: true,
    });
    Object.defineProperty(comp, 'vcr', {
      value: () => mockVcr,
      writable: true,
    });

    setInputSignal(comp.trackBy, (item: Item) => item.id);
    fixture.detectChanges();
    return { fixture, comp, hostEl };
  };

  const getItemEls = (hostEl: HTMLElement): HTMLElement[] =>
    Array.from(hostEl.querySelectorAll('.item'));

  describe('animateEnter()', () => {
    it('adds enter-from and enter-active classes', () => {
      const { comp, hostEl } = create();

      setInputSignal(comp.each, [{ id: 1, name: 'A' }]);
      TestBed.flushEffects();

      const items = getItemEls(hostEl);
      expect(items.length).toBe(1);
      expect(items[0].classList.contains('v-enter-from')).toBe(true);
      expect(items[0].classList.contains('v-enter-active')).toBe(true);
    });

    it('transitions to enter-to on next frame', () => {
      const { comp, hostEl } = create();

      setInputSignal(comp.each, [{ id: 1, name: 'A' }]);
      TestBed.flushEffects();
      flushFrame();

      const items = getItemEls(hostEl);
      expect(items[0].classList.contains('v-enter-active')).toBe(true);
      expect(items[0].classList.contains('v-enter-to')).toBe(true);
      expect(items[0].classList.contains('v-enter-from')).toBe(false);
    });

    it('cleans up all enter classes after duration', () => {
      const { comp, hostEl } = create();

      setInputSignal(comp.each, [{ id: 1, name: 'A' }]);
      TestBed.flushEffects();
      flushFrame();
      vi.advanceTimersByTime(300);

      const items = getItemEls(hostEl);
      expect(items[0].classList.contains('v-enter-from')).toBe(false);
      expect(items[0].classList.contains('v-enter-active')).toBe(false);
      expect(items[0].classList.contains('v-enter-to')).toBe(false);
    });
  });

  describe('animateLeave()', () => {
    it('adds leave-from and leave-active classes', () => {
      const { comp, hostEl } = create();
      // Initial render with item (no animation on first render).
      setInputSignal(comp.each, [{ id: 1, name: 'A' }]);
      TestBed.flushEffects();

      const itemEl = getItemEls(hostEl)[0];

      // Remove the item → triggers animateLeave.
      setInputSignal(comp.each, []);
      TestBed.flushEffects();

      expect(itemEl.classList.contains('v-leave-from')).toBe(true);
      expect(itemEl.classList.contains('v-leave-active')).toBe(true);
    });

    it('transitions to leave-to on next frame', () => {
      const { comp, hostEl } = create();
      setInputSignal(comp.each, [{ id: 1, name: 'A' }]);
      TestBed.flushEffects();

      const itemEl = getItemEls(hostEl)[0];

      setInputSignal(comp.each, []);
      TestBed.flushEffects();
      flushFrame();

      expect(itemEl.classList.contains('v-leave-active')).toBe(true);
      expect(itemEl.classList.contains('v-leave-to')).toBe(true);
      expect(itemEl.classList.contains('v-leave-from')).toBe(false);
    });

    it('removes entry from map after duration', () => {
      const { comp, hostEl } = create();
      setInputSignal(comp.each, [{ id: 1, name: 'A' }]);
      TestBed.flushEffects();

      setInputSignal(comp.each, []);
      TestBed.flushEffects();
      flushFrame();
      vi.advanceTimersByTime(300);

      expect(getItemEls(hostEl).length).toBe(0);
    });
  });

  describe('cancelLeave()', () => {
    it('cleans up leave classes and resets leaving flag', () => {
      const { comp, hostEl } = create();
      setInputSignal(comp.each, [{ id: 1, name: 'A' }]);
      TestBed.flushEffects();

      const itemEl = getItemEls(hostEl)[0];

      // Start leave.
      setInputSignal(comp.each, []);
      TestBed.flushEffects();

      // Cancel by re-adding the item.
      setInputSignal(comp.each, [{ id: 1, name: 'A' }]);
      TestBed.flushEffects();

      expect(itemEl.classList.contains('v-leave-from')).toBe(false);
      expect(itemEl.classList.contains('v-leave-active')).toBe(false);
      expect(itemEl.classList.contains('v-leave-to')).toBe(false);
    });

    it('prevents leave timer from firing', () => {
      const { comp, hostEl } = create();
      setInputSignal(comp.each, [{ id: 1, name: 'A' }]);
      TestBed.flushEffects();

      // Start leave and advance to the timer phase.
      setInputSignal(comp.each, []);
      TestBed.flushEffects();
      flushFrame();

      // Cancel the leave by re-adding the item.
      setInputSignal(comp.each, [{ id: 1, name: 'A' }]);
      TestBed.flushEffects();
      vi.advanceTimersByTime(500);

      // The item should still be rendered.
      expect(getItemEls(hostEl).length).toBeGreaterThan(0);
    });
  });

  describe('reconcile()', () => {
    it('detects new items and calls animateEnter', () => {
      const { comp, hostEl } = create();

      setInputSignal(comp.each, [{ id: 1, name: 'A' }]);
      TestBed.flushEffects();

      const items = getItemEls(hostEl);
      expect(items.length).toBe(1);
      expect(items[0].classList.contains('v-enter-from')).toBe(true);
      expect(items[0].classList.contains('v-enter-active')).toBe(true);
    });

    it('detects removed items and calls animateLeave', () => {
      const { comp, hostEl } = create();
      setInputSignal(comp.each, [{ id: 1, name: 'A' }]);
      TestBed.flushEffects();

      const itemEl = getItemEls(hostEl)[0];

      setInputSignal(comp.each, []);
      TestBed.flushEffects();

      expect(itemEl.classList.contains('v-leave-from')).toBe(true);
      expect(itemEl.classList.contains('v-leave-active')).toBe(true);
    });

    it('cancels leave when item reappears', () => {
      const { comp, hostEl } = create();
      setInputSignal(comp.each, [{ id: 1, name: 'A' }]);
      TestBed.flushEffects();

      const itemEl = getItemEls(hostEl)[0];

      // Start leave.
      setInputSignal(comp.each, []);
      TestBed.flushEffects();

      // Re-add the same item → should cancel leave.
      setInputSignal(comp.each, [{ id: 1, name: 'A' }]);
      TestBed.flushEffects();

      expect(itemEl.classList.contains('v-leave-from')).toBe(false);
      expect(itemEl.classList.contains('v-leave-active')).toBe(false);
    });
  });
});

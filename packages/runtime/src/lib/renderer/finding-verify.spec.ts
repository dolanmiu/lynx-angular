// @vitest-environment jsdom
//
// Integration harness for the flush-time whitespace normalization pass. It
// drives the REAL main-thread renderer (LynxDocument + LynxElement) against an
// in-memory fake of the native tree — a trimmed clone of teardown.spec.ts's
// harness — so Angular's actual create/attach/remove sequence exercises
// LynxElement's positional edge-trimming (processPendingTextNormalization).
//
// Why an integration harness and not renderer.spec.ts: the pass needs a real
// text SUBTREE (nested <text> + raw-text leaves) and the end()/flush lifecycle,
// neither of which the LynxBackgroundElement stand-in in renderer.spec.ts has.
//
// Reading the displayed text: a raw-text is created via __CreateRawText (which
// seeds FakeEl.text with the collapsed value) and the pass writes the trimmed
// DISPLAY via __SetAttribute('text', …) (which lands in FakeEl.attrs) — but only
// when it differs from the current value. So the effective on-screen text is
// `attrs['text'] ?? text` (see leafText).
import '@angular/compiler';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  provideZonelessChangeDetection,
  RendererFactory2,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { LynxDocument } from '../lynx-document';
import { setPageElementRef } from '../lynx-document/page-ref';
import { markFirstRenderComplete } from '../lynx-render-lifecycle';
import { LynxRendererFactory2 } from './lynx-renderer-factory2';
import { LYNX_DOCUMENT } from './token';

type FakeEl = {
  id: number;
  tag: string;
  parent: FakeEl | null;
  children: FakeEl[];
  text?: string;
  attrs: Map<string, unknown>;
  classes: Set<string>;
  hasPaintingNode: boolean;
};

let nextId = 1;
let pageRoot: FakeEl;
let flushCount = 0;
const pendingRemovedSinceFlush = new Set<FakeEl>();

const makeEl = (tag: string, text?: string): FakeEl => ({
  id: nextId++,
  tag,
  parent: null,
  children: [],
  text,
  attrs: new Map(),
  classes: new Set(),
  hasPaintingNode: true,
});

const detach = (child: FakeEl): void => {
  const p = child.parent;
  if (!p) return;
  const i = p.children.indexOf(child);
  if (i >= 0) p.children.splice(i, 1);
  child.parent = null;
};

const installNativeFakes = (): void => {
  nextId = 1;
  flushCount = 0;
  pageRoot = makeEl('page');
  pendingRemovedSinceFlush.clear();

  const g = globalThis as Record<string, unknown>;

  g.__CreatePage = () => pageRoot;
  g.__CreateView = () => makeEl('view');
  g.__CreateText = () => makeEl('text');
  g.__CreateScrollView = () => makeEl('scroll-view');
  g.__CreateImage = () => makeEl('image');
  g.__CreateRawText = (text: string) => makeEl('raw-text', text);
  g.__CreateElement = (tag: string) => makeEl(tag);
  g.__CreateWrapperElement = () => makeEl('wrapper');

  g.__GetElementUniqueID = (n: FakeEl) => n.id;
  g.__GetTag = (n: FakeEl) => n.tag;

  g.__AppendElement = (parent: FakeEl, child: FakeEl) => {
    detach(child);
    parent.children.push(child);
    child.parent = parent;
    pendingRemovedSinceFlush.delete(child);
    return child;
  };
  g.__InsertElementBefore = (parent: FakeEl, child: FakeEl, ref: FakeEl) => {
    detach(child);
    const i = parent.children.indexOf(ref);
    parent.children.splice(i < 0 ? parent.children.length : i, 0, child);
    child.parent = parent;
    pendingRemovedSinceFlush.delete(child);
    return child;
  };
  g.__RemoveElement = (parent: FakeEl, child: FakeEl) => {
    const i = parent.children.indexOf(child);
    if (i >= 0) parent.children.splice(i, 1);
    child.parent = null;
    pendingRemovedSinceFlush.add(child);
    return child;
  };

  g.__GetParent = (n: FakeEl) => n.parent ?? null;
  g.__GetChildren = (n: FakeEl) => n.children.slice();
  g.__FirstElement = (n: FakeEl) => n.children[0] ?? null;
  g.__LastElement = (n: FakeEl) => n.children[n.children.length - 1] ?? null;
  g.__NextElement = (n: FakeEl) => {
    const p = n.parent;
    if (!p) return null;
    const i = p.children.indexOf(n);
    return p.children[i + 1] ?? null;
  };

  g.__SetClasses = (n: FakeEl, s: string | undefined) => {
    n.classes = new Set((s ?? '').split(/\s+/).filter(Boolean));
  };
  g.__GetClasses = (n: FakeEl) => [...n.classes];
  g.__AddClass = (n: FakeEl, name: string) => n.classes.add(name);
  g.__SetAttribute = (n: FakeEl, name: string, value: unknown) =>
    n.attrs.set(name, value);
  g.__GetAttributeByName = (n: FakeEl, name: string) => n.attrs.get(name);
  g.__SetID = (n: FakeEl, id: string) => n.attrs.set('id', id);
  g.__SetDataset = () => {};
  g.__SetConfig = () => {};
  g.__AddInlineStyle = () => {};
  g.__SetInlineStyles = () => {};
  g.__AddEvent = () => {};
  g.__FlushElementTree = () => {
    flushCount++;
    const killSubtree = (n: FakeEl): void => {
      n.hasPaintingNode = false;
      for (const c of n.children) killSubtree(c);
    };
    for (const node of pendingRemovedSinceFlush) killSubtree(node);
    pendingRemovedSinceFlush.clear();
  };
  g.__ElementAnimate = () => {};

  setPageElementRef(pageRoot as unknown as never);
};

/**
 * A raw-text's displayed text: the pass writes trimmed display via
 * __SetAttribute (→ attrs) only when it changes, else the collapsed baked value
 * (→ text) stands — mirroring that both target the same native text property.
 */
const leafText = (el: FakeEl): string =>
  (el.attrs.has('text') ? (el.attrs.get('text') as string) : (el.text ?? '')) ??
  '';

/**
 * Raw-text leaves under `el`, in document order, through LIVE painting nodes
 * only (a dead subtree is invisible on-device).
 */
const rawTextLeaves = (el: FakeEl): FakeEl[] => {
  const out: FakeEl[] = [];
  const walk = (n: FakeEl): void => {
    for (const c of n.children) {
      if (!c.hasPaintingNode) continue;
      if (c.tag === 'raw-text') out.push(c);
      else walk(c);
    }
  };
  walk(el);
  return out;
};

const descendants = (): FakeEl[] => {
  const out: FakeEl[] = [];
  const walk = (n: FakeEl): void => {
    for (const c of n.children) {
      if (!c.hasPaintingNode) continue;
      out.push(c);
      walk(c);
    }
  };
  walk(pageRoot);
  return out;
};

/**
 * The concatenated on-screen text of the single live <text> with `cls`.
 */
const renderedText = (cls: string): string => {
  const roots = descendants().filter((n) => n.classes.has(cls));
  if (roots.length !== 1) {
    throw new Error(`expected exactly one live .${cls}, got ${roots.length}`);
  }
  return rawTextLeaves(roots[0]).map(leafText).join('');
};

const flush = (): Promise<void> =>
  new Promise<void>((resolve) => setTimeout(resolve));

// --- Test components ----------------------------------------------------------

/**
 * Projects <ng-content> into a native <text>, mirroring @blotch/ui wrappers.
 */
@Component({
  selector: 'wrap-text',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<text class="wrap"><ng-content /></text>`,
})
class WrapText {}

/**
 * The flagship-demo regression: three styled runs projected into one <text>.
 */
@Component({
  selector: 'multi-run-host',
  standalone: true,
  imports: [WrapText],
  encapsulation: ViewEncapsulation.None,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<wrap-text
    ><text class="a">One </text><text class="b">two</text
    ><text class="c"> three</text></wrap-text
  >`,
})
class MultiRunHost {}

/**
 * A single plain string projected into a <text>.
 */
@Component({
  selector: 'single-run-host',
  standalone: true,
  imports: [WrapText],
  encapsulation: ViewEncapsulation.None,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<wrap-text>Hello from Angular</wrap-text>`,
})
class SingleRunHost {}

/**
 * Multi-line prose in a block <text> — the original leading-space bug.
 */
@Component({
  selector: 'prose-host',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: ` <text class="prose"> The quick brown fox </text> `,
})
class ProseHost {}

/**
 * Runs driven by a signal via @for — lets one component test every run combo.
 */
@Component({
  selector: 'dynamic-runs-host',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<text class="dyn">
    @for (r of runs(); track $index) {
      <text>{{ r }}</text>
    }
  </text>`,
})
class DynamicRunsHost {
  readonly runs = signal<string[]>([]);
}

/**
 * A single interpolated run — value carries edge whitespace at runtime.
 */
@Component({
  selector: 'interp-host',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<text class="interp">{{ label() }}</text>`,
})
class InterpHost {
  readonly label = signal('');
}

/**
 * The multi-run text wrapped in an @if, to exercise remount (recreate).
 */
@Component({
  selector: 'toggle-host',
  standalone: true,
  imports: [WrapText],
  encapsulation: ViewEncapsulation.None,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `@if (show()) {
    <wrap-text
      ><text class="a">One </text><text class="b">two</text
      ><text class="c"> three</text></wrap-text
    >
  }`,
})
class ToggleHost {
  readonly show = signal(true);
}

// --- FINDING VERIFICATION COMPONENTS ----------------------------------------

/**
 * Component-wrapped projection that starts CLOSED (open=false). The consumer's
 * projected multi-run text is created by the OUTER component but not attached
 * into the slot's <text> until first expand — so the projected raw-text WRAPPERS
 * survive across toggles (recreate-on-remount path). This is the accordion shape.
 */
let lastMultiSlot: MultiRunSlot;

@Component({
  selector: 'multi-run-slot',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `@if (open()) {
    <text class="slot"><ng-content /></text>
  }`,
})
class MultiRunSlot {
  readonly open = signal(false);
  constructor() {
    // eslint-disable-next-line no-this-alias, @typescript-eslint/no-this-alias
    lastMultiSlot = this;
  }
}

@Component({
  selector: 'multi-run-cycle-host',
  standalone: true,
  imports: [MultiRunSlot],
  encapsulation: ViewEncapsulation.None,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<multi-run-slot
    ><text class="a">One </text><text class="b">two</text
    ><text class="c"> three</text></multi-run-slot
  >`,
})
class MultiRunCycleHost {}

describe('inline text whitespace normalization', () => {
  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
  });

  beforeEach(() => {
    vi.stubGlobal('__MAIN_THREAD__', true);
    installNativeFakes();
    // Without this, end() skips __FlushElementTree() (first-render latch) and the
    // painting model never fires — see teardown.spec.ts's note.
    markFirstRenderComplete();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: LYNX_DOCUMENT, useValue: new LynxDocument() },
        LynxRendererFactory2,
        { provide: RendererFactory2, useExisting: LynxRendererFactory2 },
      ],
    });
  });

  // ---- FINDING SCENARIO A: closed-slot projection (create+attach across cycles) ----
  it('SCENARIO A: multi-run projected into a slot that starts CLOSED, then opened', async () => {
    const fixture = TestBed.createComponent(MultiRunCycleHost);
    fixture.detectChanges();
    await flush();
    // open the slot -> projected runs attach into the <text> for the first time
    lastMultiSlot.open.set(true);
    fixture.detectChanges();
    await flush();
    expect(renderedText('slot')).toBe('One two three');
  });

  it('SCENARIO A2: closed slot, open, close, reopen (recreate-on-remount path)', async () => {
    const fixture = TestBed.createComponent(MultiRunCycleHost);
    fixture.detectChanges();
    await flush();
    lastMultiSlot.open.set(true);
    fixture.detectChanges();
    await flush();
    expect(renderedText('slot')).toBe('One two three');
    lastMultiSlot.open.set(false);
    fixture.detectChanges();
    await flush();
    lastMultiSlot.open.set(true);
    fixture.detectChanges();
    await flush();
    expect(renderedText('slot')).toBe('One two three');
  });

  // ---- FINDING SCENARIO B: create-then-remove in the SAME cycle, then remount ----
  // The ToggleHost projects nothing (inline template), so the runs are created
  // fresh each open. But test the claim directly: does a node removed in the same
  // cycle it was created carry a stale #text into a remount? Use the closed-slot
  // shape but flip open true->false->? We approximate the 'same cycle create+remove'
  // by toggling within detectChanges via a computed that immediately closes.
  it('SCENARIO B: toggle-host inline @if off then on', async () => {
    const fixture = TestBed.createComponent(ToggleHost);
    fixture.detectChanges();
    expect(renderedText('wrap')).toBe('One two three');
    fixture.componentInstance.show.set(false);
    fixture.detectChanges();
    await flush();
    fixture.componentInstance.show.set(true);
    fixture.detectChanges();
    await flush();
    expect(renderedText('wrap')).toBe('One two three');
  });
});

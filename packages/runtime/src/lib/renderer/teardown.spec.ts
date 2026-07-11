// @vitest-environment jsdom
// cspell:words reproj
//
// Integration harness that drives the REAL main-thread renderer path
// (LynxDocument + LynxElement) against an in-memory fake of the native element
// tree. This lets Angular's actual view-teardown sequence exercise
// LynxElement.remove() so we can regression-test two things that must both hold:
//
//   1. Destroying an @if block that contains a native <overlay> fully removes
//      that subtree from the native tree (no orphaned overlay window, no leak).
//   2. Toggling an @if that wraps <ng-content> re-projects the projected content
//      back into the re-created slot (the scenario the old "park children at the
//      page root" hack existed to protect).
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
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { LynxDocument } from '../lynx-document';
import { setPageElementRef } from '../lynx-document/page-ref';
import { LynxRendererFactory2 } from './lynx-renderer-factory2';
import { LYNX_DOCUMENT } from './token';

// --- Fake native element tree -------------------------------------------------
// Each node is a plain object standing in for a Lynx ElementRef. The __* PAPI
// globals below mutate these objects to mimic how the native engine maintains
// the element tree.
type FakeEl = {
  id: number;
  tag: string;
  parent: FakeEl | null;
  children: FakeEl[];
  text?: string;
  attrs: Map<string, unknown>;
  classes: Set<string>;
  styles: Map<string, unknown>;
};

let nextId = 1;
let pageRoot: FakeEl;
// Faithful device model: once a node is unlinked via __RemoveElement, it and its
// whole subtree are "dead" and can never be re-attached (see the park-children
// note in lynx-element.ts). Re-appending a dead node is a no-op on device. This
// is the constraint that makes the re-projection test meaningful — without it a
// naive fake would happily re-attach cascade-removed content that Lynx would not.
let dead: WeakSet<FakeEl>;

const makeEl = (tag: string, text?: string): FakeEl => ({
  id: nextId++,
  tag,
  parent: null,
  children: [],
  text,
  attrs: new Map(),
  classes: new Set(),
  styles: new Map(),
});

const detach = (child: FakeEl): void => {
  const p = child.parent;
  if (!p) return;
  const i = p.children.indexOf(child);
  if (i >= 0) p.children.splice(i, 1);
  child.parent = null;
};

const markSubtreeDead = (n: FakeEl): void => {
  dead.add(n);
  for (const c of n.children) markSubtreeDead(c);
};

const installNativeFakes = (): void => {
  nextId = 1;
  pageRoot = makeEl('page');
  dead = new WeakSet<FakeEl>();

  const g = globalThis as Record<string, unknown>;

  g.__CreatePage = () => pageRoot;
  g.__CreateView = () => makeEl('view');
  g.__CreateText = () => makeEl('text');
  g.__CreateScrollView = () => makeEl('scroll-view');
  g.__CreateImage = () => makeEl('image');
  g.__CreateRawText = (text: string) => makeEl('raw-text', text);
  g.__CreateElement = (tag: string) => makeEl(tag);
  // Real <block> creation calls __CreateWrapperElement, whose native tag is
  // "wrapper" — LynxElement.tagName is separately tracked as 'block' by
  // LynxDocument (see lynx-document.ts), which is what remove() keys off.
  g.__CreateWrapperElement = () => makeEl('wrapper');

  g.__GetElementUniqueID = (n: FakeEl) => n.id;
  g.__GetTag = (n: FakeEl) => n.tag;

  g.__AppendElement = (parent: FakeEl, child: FakeEl) => {
    if (dead.has(child)) return child; // dead nodes can't be re-attached
    detach(child);
    parent.children.push(child);
    child.parent = parent;
    return child;
  };
  g.__InsertElementBefore = (parent: FakeEl, child: FakeEl, ref: FakeEl) => {
    if (dead.has(child)) return child; // dead nodes can't be re-attached
    detach(child);
    const i = parent.children.indexOf(ref);
    parent.children.splice(i < 0 ? parent.children.length : i, 0, child);
    child.parent = parent;
    return child;
  };
  g.__RemoveElement = (parent: FakeEl, child: FakeEl) => {
    const i = parent.children.indexOf(child);
    if (i >= 0) parent.children.splice(i, 1);
    child.parent = null;
    markSubtreeDead(child);
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
  g.__AddInlineStyle = (n: FakeEl, key: string, value: unknown) => {
    if (value == null) n.styles.delete(key);
    else n.styles.set(key, value);
  };
  g.__SetInlineStyles = (n: FakeEl, value: unknown) =>
    n.styles.set('__inline', value);
  g.__AddEvent = () => {};
  g.__FlushElementTree = () => {};
  g.__ElementAnimate = () => {};

  setPageElementRef(pageRoot as unknown as never);
};

/**
 * Every node reachable from the page root (excluding the root itself).
 */
const descendants = (): FakeEl[] => {
  const out: FakeEl[] = [];
  const walk = (n: FakeEl): void => {
    for (const c of n.children) {
      out.push(c);
      walk(c);
    }
  };
  walk(pageRoot);
  return out;
};

const tagsUnderRoot = (): string[] => descendants().map((n) => n.tag);
const findByClass = (cls: string): FakeEl[] =>
  descendants().filter((n) => n.classes.has(cls));

/**
 * Does `ancestor` sit somewhere above `node` in the tree?
 */
const isAncestorOf = (ancestor: FakeEl, node: FakeEl | null): boolean => {
  for (let cur = node?.parent ?? null; cur; cur = cur.parent) {
    if (cur === ancestor) return true;
  }
  return false;
};

// --- Test components ----------------------------------------------------------

/**
 * Mirrors ui-select → ui-bottom-sheet: a child component whose template renders a
 * native <overlay> wrapping projected <ng-content>, placed inside an @if in the
 * parent so toggling the flag destroys the whole subtree (overlay included).
 */
@Component({
  selector: 'sheet-like',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<overlay
    ><view class="backdrop"><ng-content /></view
  ></overlay>`,
})
class SheetLike {}

@Component({
  selector: 'overlay-host',
  standalone: true,
  imports: [SheetLike],
  encapsulation: ViewEncapsulation.None,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    @if (show()) {
      <view class="wrapper">
        <sheet-like><text>projected</text></sheet-like>
      </view>
    }
  `,
})
class OverlayHost {
  readonly show = signal(true);
}

/**
 * Re-projection scenario: an @if wrapping <ng-content>. Toggling `open` destroys
 * and re-creates the slot; the projected content is owned by the parent and must
 * survive to be re-projected into the new slot.
 */
// Captured on construction so the test can toggle the child's own signal without
// relying on debugElement/viewChild, neither of which resolves in this
// jsdom + Lynx-renderer TestBed setup.
let lastSlot: ReprojSlot;

@Component({
  selector: 'reproj-slot',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `@if (open()) {
    <view class="slot"><ng-content /></view>
  }`,
})
class ReprojSlot {
  readonly open = signal(true);
  constructor() {
    // Deliberately capture the instance so the test can toggle its own signal.
    // eslint-disable-next-line no-this-alias, @typescript-eslint/no-this-alias
    lastSlot = this;
  }
}

@Component({
  selector: 'reproj-host',
  standalone: true,
  imports: [ReprojSlot],
  encapsulation: ViewEncapsulation.None,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<reproj-slot><text class="projected">hi</text></reproj-slot>`,
})
class ReprojHost {}

/**
 * <block> is a layout-only flattening container (backed by
 * __CreateWrapperElement) whose children have no native UI subtree of their
 * own. Destroying it must remove the whole subtree in one shot rather than
 * parking its children on the page root first — picking them apart
 * individually corrupts the native flatten bookkeeping (see the <block>
 * exception in LynxElement.remove()).
 */
@Component({
  selector: 'block-host',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    @if (show()) {
      <block>
        <text class="a">one</text>
        <text class="b">two</text>
      </block>
    }
  `,
})
class BlockHost {
  readonly show = signal(true);
}

describe('renderer teardown', () => {
  beforeAll(() => {
    TestBed.initTestEnvironment(
      BrowserDynamicTestingModule,
      platformBrowserDynamicTesting(),
    );
  });

  beforeEach(() => {
    vi.stubGlobal('__MAIN_THREAD__', true);
    installNativeFakes();

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

  it('fully removes an <overlay> subtree when its @if block is destroyed', () => {
    const fixture = TestBed.createComponent(OverlayHost);
    fixture.detectChanges();

    // Sanity: the overlay is present while the @if is truthy.
    expect(tagsUnderRoot()).toContain('overlay');

    fixture.componentInstance.show.set(false);
    fixture.detectChanges();

    // The whole subtree — overlay included — must be gone from the native tree.
    // A lingering overlay is a live iOS window with no owning Angular view, and
    // the orphaned subtree leaks native element-pool slots.
    expect(tagsUnderRoot()).not.toContain('overlay');
    expect(tagsUnderRoot()).not.toContain('backdrop');
    expect(findByClass('wrapper')).toHaveLength(0);
    expect(findByClass('backdrop')).toHaveLength(0);
  });

  it("fully removes a <block>'s children instead of parking them on the page root", () => {
    const fixture = TestBed.createComponent(BlockHost);
    fixture.detectChanges();

    // Sanity: the block and its children are present while the @if is truthy.
    expect(tagsUnderRoot()).toContain('wrapper');
    expect(findByClass('a')).toHaveLength(1);
    expect(findByClass('b')).toHaveLength(1);

    fixture.componentInstance.show.set(false);
    fixture.detectChanges();

    // The whole subtree must be gone — not parked as orphans directly under
    // the page root, which is what crashed on-device (same failure class as
    // parking an <overlay>'s subtree).
    expect(tagsUnderRoot()).not.toContain('wrapper');
    expect(findByClass('a')).toHaveLength(0);
    expect(findByClass('b')).toHaveLength(0);
  });

  it('re-projects <ng-content> when a wrapping @if toggles off and on', () => {
    const fixture = TestBed.createComponent(ReprojHost);
    fixture.detectChanges();
    const slot = lastSlot;

    // Projected content starts inside the slot.
    expect(findByClass('projected')).toHaveLength(1);
    expect(findByClass('slot')).toHaveLength(1);
    expect(
      isAncestorOf(findByClass('slot')[0], findByClass('projected')[0]),
    ).toBe(true);

    // Destroy the slot (projected content must survive detach), then re-create it.
    slot.open.set(false);
    fixture.detectChanges();
    slot.open.set(true);
    fixture.detectChanges();

    // The projected content must be alive again and nested inside the new slot.
    const projected = findByClass('projected');
    const newSlot = findByClass('slot');
    expect(projected).toHaveLength(1);
    expect(newSlot).toHaveLength(1);
    expect(isAncestorOf(newSlot[0], projected[0])).toBe(true);
    // And its text child must have come along.
    expect(projected[0].children.map((c) => c.text)).toContain('hi');
  });
});

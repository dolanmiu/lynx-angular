// @vitest-environment jsdom
// Low-level reproduction of the reported finding: a text subtree whose ONLY
// normalization opportunity falls in the SAME cycle it is torn down, then is
// remounted later — does #recreateSubtree bake stale untrimmed #text?
import '@angular/compiler';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LynxDocument } from '../lynx-document';
import { setPageElementRef } from '../lynx-document/page-ref';
import {
  processPendingRemovals,
  processPendingTextNormalization,
} from '../lynx-element';

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
  pageRoot = makeEl('page');
  pendingRemovedSinceFlush.clear();
  const g = globalThis as Record<string, unknown>;
  g.__CreatePage = () => pageRoot;
  g.__CreateView = () => makeEl('view');
  g.__CreateText = () => makeEl('text');
  g.__CreateImage = () => makeEl('image');
  g.__CreateRawText = (text: string) => makeEl('raw-text', text);
  g.__CreateElement = (tag: string) => makeEl(tag);
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
  g.__AddInlineStyle = () => {};
  g.__SetInlineStyles = () => {};
  g.__AddEvent = () => {};
  g.__ElementAnimate = () => {};
  g.__FlushElementTree = () => {
    const killSubtree = (n: FakeEl): void => {
      n.hasPaintingNode = false;
      for (const c of n.children) killSubtree(c);
    };
    for (const node of pendingRemovedSinceFlush) killSubtree(node);
    pendingRemovedSinceFlush.clear();
  };
  setPageElementRef(pageRoot as unknown as never);
};

const leafText = (el: FakeEl): string =>
  (el.attrs.has('text') ? (el.attrs.get('text') as string) : (el.text ?? '')) ??
  '';

const displayedLeaves = (root: FakeEl): string => {
  const out: string[] = [];
  const walk = (n: FakeEl): void => {
    for (const c of n.children) {
      if (c.tag === 'raw-text') out.push(leafText(c));
      else if (c.tag === 'text') walk(c);
    }
  };
  walk(root);
  return out.join('');
};

describe('finding: same-cycle create+remove then remount', () => {
  beforeEach(() => {
    vi.stubGlobal('__MAIN_THREAD__', true);
    installNativeFakes();
  });

  // Drive the renderer API directly to reproduce the EXACT claimed sequence,
  // controlling the ordering that Angular normally hides.
  it('remounts with correctly-trimmed text after same-cycle create+remove', () => {
    const doc = new LynxDocument();
    doc.createRootElement();

    // A surviving component owns the projected <text> root and its runs. We keep
    // JS references to the wrappers so we can re-insert the SAME instances later
    // (the recreate-on-remount path), mirroring projected content.
    const textRoot = doc.createElement('text') as any; // <text class="slot">
    const runA = doc.createText(' Hello '); // collapsed-untrimmed ' Hello '
    // Attach runs into the text root, then attach the root to a slot host.
    textRoot.appendChild(runA); // enqueues normalization

    // A slot host that will be created and destroyed within the SAME cycle.
    const slotHost = doc.createElement('view') as any;
    slotHost.appendChild(textRoot); // enqueues newChild=textRoot
    doc.page.appendChild(slotHost);

    // --- SAME CYCLE: now tear the slot host down (the @if flips true->false in
    // one tick, or a @for reconciles the just-created row away). ---
    slotHost.remove(); // queues removal

    // end() ordering: removals FIRST, then normalization.
    processPendingRemovals(); // #doRemove -> textRoot & runA marked paintingDead
    processPendingTextNormalization(); // should SKIP runA's root (paintingDead)
    (globalThis as any).__FlushElementTree();

    // --- LATER CYCLE: re-show. Re-insert the SAME slotHost wrapper (projected
    // content survives) -> #recreateIfDead -> #recreateSubtree bakes #text. ---
    doc.page.appendChild(slotHost);
    processPendingRemovals();
    processPendingTextNormalization();
    (globalThis as any).__FlushElementTree();

    // The remounted raw-text should display trimmed 'Hello', not ' Hello '.
    const liveRoot = pageRoot.children.find((c) => c.tag === 'view')
      ?.children[0];
    expect(liveRoot).toBeDefined();
    expect(displayedLeaves(liveRoot as FakeEl)).toBe('Hello');
  });
});

import type { ElementRef } from './types/lynx';

type LynxEventType =
  | 'bindEvent'
  | 'catchEvent'
  | 'capture-bindEvent'
  | 'capture-catchEvent'
  | 'global-bindEvent';

const EVENT_PREFIXES: [string, LynxEventType][] = [
  ['capture-bind', 'capture-bindEvent'],
  ['capture-catch', 'capture-catchEvent'],
  ['global-bind', 'global-bindEvent'],
  ['catch', 'catchEvent'],
  ['bind', 'bindEvent'],
];

export type BaseLynxElement = {
  setProperty(name: string, value: any): void;
  setAttribute(name: string, value: any): void;
  getAttribute(name: string): string | null;
  removeAttribute(name: string): void;
  setStyle(key: string, value: unknown): void;
  removeStyle(key: string): void;
  setInlineStyles(inlineStyle: string): void;
  insertBefore(
    newChild: BaseLynxElement,
    refChild: BaseLynxElement | null,
  ): void;
  appendChild(newChild: BaseLynxElement): void;
  addClass(name: string): void;
  removeClass(name: string): void;
  remove(): void;
  parentNode(): BaseLynxElement | null;
  nextSibling(): BaseLynxElement | null;
  querySelector(selector: string): BaseLynxElement | null;
  querySelectorAll(selector: string): BaseLynxElement[];
  addEventListener(name: string, cb: (event: any) => any): () => void;
};
export class LynxElement implements BaseLynxElement {
  readonly element: ElementRef;

  // Virtual tree tracking — used when parent manages children outside the
  // native element tree (e.g., x-list manages children via componentAtIndex
  // callbacks rather than __AppendElement)
  _virtualParent: LynxElement | null = null;
  _virtualPrev: LynxElement | null = null;
  _virtualNext: LynxElement | null = null;

  constructor(element: ElementRef) {
    this.element = element;
  }

  setProperty(name: string, value: any): void {
    this.setAttribute(name, value);
  }
  setAttribute(name: string, value: any): void {
    if (name === 'class') {
      this.addClass(value);
    } else if (name === 'style') {
      this.setInlineStyles(value);
    } else if (name === 'id') {
      __SetID(this.element, value);
    } else if (name.startsWith('data-')) {
      const data: Record<string, any> = {};
      const key = name.slice(5);
      data[key] = value;
      __SetDataset(this.element, data);
    } else {
      __SetAttribute(this.element, name, value);
    }
  }

  getAttribute(name: string) {
    return __GetAttributeByName(this.element, name) as string;
  }

  removeAttribute(name: string): void {
    this.setAttribute(name, null);
  }

  setStyle(key: string, value: unknown): void {
    __AddInlineStyle(this.element, key, value);
  }
  removeStyle(key: string): void {
    __AddInlineStyle(this.element, key, null);
  }
  setInlineStyles(inlineStyle: string): void {
    __SetInlineStyles(this.element, inlineStyle);
  }

  insertBefore(newChild: LynxElement, refChild: LynxElement | null): void {
    if (refChild == null) {
      this.appendChild(newChild);
    } else {
      __InsertElementBefore(this.element, newChild.element, refChild.element);
    }
  }

  appendChild(newChild: LynxElement): void {
    __AppendElement(this.element, newChild.element);
    // should we flush?
  }

  addClass(name: string): void {
    __AddClass(this.element, name);
  }

  removeClass(name: string): void {
    const classes = __GetClasses(this.element).filter((c) => c !== name);
    __SetClasses(this.element, classes.join(' '));
  }

  remove() {
    if (this._virtualParent) {
      // Remove from virtual tree (e.g., when parent is an x-list)
      if (this._virtualParent instanceof LynxListElement) {
        this._virtualParent.removeVirtualChild(this);
      }
      return;
    }
    const parent = this.parentNode();
    if (!parent) {
      return;
    }
    __RemoveElement((parent as LynxElement).element, this.element);
  }

  parentNode(): LynxElement | null {
    if (this._virtualParent) return this._virtualParent;
    const parent = __GetParent(this.element);
    if (!parent) return null;
    return new LynxElement(parent);
  }

  nextSibling(): LynxElement | null {
    // If in a virtual tree, use virtual sibling tracking
    if (this._virtualParent) return this._virtualNext;
    const nextSibling = __NextElement(this.element);
    if (!nextSibling) return null;
    return new LynxElement(nextSibling);
  }

  querySelector(selector: string): LynxElement | null {
    const element = __QuerySelector(this.element, selector, {});
    if (!element) return null;
    return new LynxElement(element);
  }
  querySelectorAll(selector: string): LynxElement[] {
    return __QuerySelectorAll(this.element, selector, {}).map(
      (e) => new LynxElement(e),
    );
  }
  addEventListener(name: string, cb: (event: any) => any) {
    let eventName = '';
    let eventType: LynxEventType | undefined;

    for (const [prefix, type] of EVENT_PREFIXES) {
      if (name.startsWith(prefix)) {
        eventName = name.slice(prefix.length);
        eventType = type;
        break;
      }
    }

    if (!eventType) {
      return () => {};
    }

    __AddEvent(this.element, eventType, eventName, {
      type: 'worklet',
      value: cb,
    });

    return () => {
      const events = __GetEvents(this.element);
      const filtered = Object.entries(events).reduce<
        Record<string, Record<string, any>>
      >((acc, [key, value]) => {
        if (key !== `${eventType}:${eventName}`) {
          acc[key] = value;
        }
        return acc;
      }, {});
      __SetEvents(this.element, Object.values(filtered));
    };
  }
}

/**
 * Manages x-list children in a virtual tree instead of the native element tree.
 *
 * Lynx's native x-list is a virtualized list driven by engine callbacks
 * (componentAtIndex / enqueueComponent). Children must NOT be appended via
 * __AppendElement — the list calls componentAtIndex to request items by index,
 * and update-list-info tells it which indices exist.
 *
 * Angular's rendering model appends children directly, so this class intercepts
 * appendChild/insertBefore and stores children in a JS-level linked list.
 */
// Module-level set of LynxListElements that need their native list updated.
// Drained by processPendingListUpdates() which is called from
// LynxRendererFactory2.end() — right before __FlushElementTree().
const pendingListUpdates = new Set<LynxListElement>();

// The page element, set by LynxDocument.createRootElement() so the microtask
// fallback in _scheduleUpdate can flush it without a reference to LynxDocument.
let _pageElement: ElementRef | null = null;
export const setPageElement = (el: ElementRef): void => {
  _pageElement = el;
};

/**
 * Process all pending list updates. Called from LynxRendererFactory2.end()
 * before __FlushElementTree() so list updates are flushed as part of the
 * normal Angular CD cycle — never from setTimeout (which crashes native).
 */
export const processPendingListUpdates = (): void => {
  if (pendingListUpdates.size === 0) return;
  // Copy & clear before iterating — a processUpdate could theoretically
  // trigger further mutations, though unlikely.
  const lists = [...pendingListUpdates];
  pendingListUpdates.clear();
  for (const list of lists) {
    list._processUpdate();
  }
};

export class LynxListElement extends LynxElement {
  private _firstVirtualChild: LynxElement | null = null;
  private _lastVirtualChild: LynxElement | null = null;
  private readonly _nonElements: WeakSet<ElementRef>;
  private _destroyed = false;
  // Tracks which list-item elements have been appended to the native list tree.
  // We append once (in flushIntoNativeList on first componentAtIndex call) and
  // never again — __AppendElement is not idempotent.
  private _appendedToNativeList = new WeakSet<ElementRef>();

  // Stored so we can re-register them via __UpdateListCallbacks before each flush.
  // React Lynx re-registers callbacks every flush cycle (listUpdateInfo.ts flush()).
  private _componentAtIndex: any;
  private _enqueueComponent: any;
  private _componentAtIndexes: any;

  constructor(element: ElementRef, nonElements: WeakSet<ElementRef>) {
    super(element);
    this._nonElements = nonElements;
  }

  /** Store the list callbacks so they can be re-registered before each flush. */
  setCallbacks(
    componentAtIndex: any,
    enqueueComponent: any,
    componentAtIndexes: any,
  ): void {
    this._componentAtIndex = componentAtIndex;
    this._enqueueComponent = enqueueComponent;
    this._componentAtIndexes = componentAtIndexes;
  }

  override remove(): void {
    this._destroyed = true;
    pendingListUpdates.delete(this);
    super.remove();
  }

  override appendChild(newChild: LynxElement): void {
    newChild._virtualParent = this;
    newChild._virtualPrev = this._lastVirtualChild;
    newChild._virtualNext = null;

    if (this._lastVirtualChild) {
      this._lastVirtualChild._virtualNext = newChild;
    }
    if (!this._firstVirtualChild) {
      this._firstVirtualChild = newChild;
    }
    this._lastVirtualChild = newChild;

    this._scheduleUpdate();
  }

  override insertBefore(
    newChild: LynxElement,
    refChild: LynxElement | null,
  ): void {
    if (refChild == null) {
      this.appendChild(newChild);
      return;
    }

    newChild._virtualParent = this;
    newChild._virtualNext = refChild;
    newChild._virtualPrev = refChild._virtualPrev;

    if (refChild._virtualPrev) {
      refChild._virtualPrev._virtualNext = newChild;
    } else {
      this._firstVirtualChild = newChild;
    }
    refChild._virtualPrev = newChild;

    this._scheduleUpdate();
  }

  removeVirtualChild(child: LynxElement): void {
    if (child._virtualPrev) {
      child._virtualPrev._virtualNext = child._virtualNext;
    } else {
      this._firstVirtualChild = child._virtualNext;
    }
    if (child._virtualNext) {
      child._virtualNext._virtualPrev = child._virtualPrev;
    } else {
      this._lastVirtualChild = child._virtualPrev;
    }

    child._virtualParent = null;
    child._virtualPrev = null;
    child._virtualNext = null;

    // Remove from native list tree if it was already appended there.
    if (this._appendedToNativeList.has(child.element)) {
      __RemoveElement(this.element, child.element);
      this._appendedToNativeList.delete(child.element);
    }

    this._scheduleUpdate();
  }

  /** Returns ElementRefs of real UI children (excludes NoneElements / comment markers). */
  getUIChildren(): ElementRef[] {
    const children: ElementRef[] = [];
    let child = this._firstVirtualChild;
    while (child) {
      if (!this._nonElements.has(child.element)) {
        children.push(child.element);
      }
      child = child._virtualNext;
    }
    return children;
  }

  isAppendedToNativeList(child: ElementRef): boolean {
    return this._appendedToNativeList.has(child);
  }

  markAppendedToNativeList(child: ElementRef): void {
    this._appendedToNativeList.add(child);
  }

  /**
   * Append a child to the native list element tree (idempotent).
   * Called from the componentAtIndex callback in lynx-document.ts —
   * elements are connected to the native list on demand when the engine
   * requests them, matching the React Lynx reference pattern.
   */
  appendChildToNativeList(child: ElementRef): void {
    if (!this._appendedToNativeList.has(child)) {
      __AppendElement(this.element, child);
      this._appendedToNativeList.add(child);
    }
  }

  /**
   * Mark this list for update. The actual processing happens in
   * processPendingListUpdates(), called from LynxRendererFactory2.end()
   * right before __FlushElementTree(). This ensures list updates are
   * flushed as part of the normal Angular CD cycle — calling
   * __FlushElementTree from setTimeout crashes the native engine.
   */
  private _scheduleUpdate(): void {
    if (this._destroyed) return;
    const wasEmpty = pendingListUpdates.size === 0;
    pendingListUpdates.add(this);
    if (wasEmpty) {
      // Safety net for cases where list items are created outside a begin/end
      // CD cycle (e.g. lazy-loaded route components on first navigation).
      // If end() drains the set first, this microtask is a no-op.
      // queueMicrotask is safe here — unlike setTimeout, it runs synchronously
      // within the current task and before __FlushElementTree from end() fires.
      queueMicrotask(() => {
        if (pendingListUpdates.size > 0) {
          processPendingListUpdates();
          __FlushElementTree();
        }
      });
    }
  }

  /**
   * Process a pending list update: set item-key on each child,
   * append children to native list tree, and set update-list-info.
   * Called from processPendingListUpdates() — NOT directly.
   * __FlushElementTree() is called afterwards by the renderer factory.
   */
  _processUpdate(): void {
    if (this._destroyed) return;
    const uiChildren = this.getUIChildren();
    (globalThis as any).__dbg =
      `${(globalThis as any).__dbg || ''}proc:${uiChildren.length}\n`;

    // item-key is required on each list-item — the native x-list reads
    // it from the element when processing update-list-info.
    // recyclable=false tells the engine not to recycle items since we
    // don't implement a recycle pool in enqueueComponent.
    const listID = __GetElementUniqueID(this.element);

    for (const child of uiChildren) {
      // item-key and recyclable go into insertAction, not __SetAttribute on the element.
      // React Lynx reads these from __listItemPlatformInfo (JSX props) and spreads
      // them into insertAction — it does NOT call __SetAttribute for platform attrs.
      __SetAttribute(child, 'recyclable', false);
    }

    (globalThis as any).__dbg += `listID=${listID},kids=${uiChildren.length}\n`;

    // Try plain object (not array). The test mock auto-wraps single calls into an array —
    // maybe the real engine also expects a plain object, and our array was causing it to
    // skip calling componentAtIndex.
    const listInfo = {
      insertAction: uiChildren.map((child, i) => ({
        position: i,
        type: '__angular_list_item',
        'item-key':
          __GetAttributeByName(child, 'item-key') ??
          __GetElementUniqueID(child),
        'estimated-main-axis-size-px':
          __GetAttributeByName(child, 'estimated-main-axis-size-px') ?? 50,
      })),
      removeAction: [],
      updateAction: [],
    };
    (globalThis as any).__dbg += `info:${JSON.stringify(listInfo)}\n`;
    __SetAttribute(this.element, 'update-list-info', listInfo);

    // Re-register callbacks before every flush (React Lynx pattern).
    __UpdateListCallbacks(
      this.element,
      this._componentAtIndex,
      this._enqueueComponent,
      this._componentAtIndexes,
    );
  }
}

export class LynxBackgroundElement implements BaseLynxElement {
  private props = new Map<string, any>();
  private styles = new Map<string, any>();
  private classes = new Set<string>();
  private events = new Map<string, (event: any) => any>();
  private _parent: LynxBackgroundElement | null = null;
  private firstChild: LynxBackgroundElement | null = null;
  private lastChild: LynxBackgroundElement | null = null;
  private _previousSibling: LynxBackgroundElement | null = null;
  private _nextSibling: LynxBackgroundElement | null = null;

  setProperty(name: string, value: any): void {
    this.props.set(name, value);
  }
  setAttribute(name: string, value: any): void {
    this.props.set(name, value);
  }
  getAttribute(name: string): string | null {
    return this.props.get(name) ?? null;
  }
  removeAttribute(name: string): void {
    this.props.delete(name);
  }
  setStyle(key: string, value: unknown): void {
    this.styles.set(key, value);
  }
  removeStyle(key: string): void {
    this.styles.delete(key);
  }
  setInlineStyles(inlineStyle: string): void {
    const styles = inlineStyle
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    for (const s of styles) {
      const [key, value] = s.split(':').map((s) => s.trim());
      this.setStyle(key, value);
    }
  }

  insertBefore(
    newChild: LynxBackgroundElement,
    refChild: LynxBackgroundElement | null,
  ): void {
    if (refChild == null) {
      this.appendChild(newChild);
      return;
    }
    if (!refChild._previousSibling) {
      this.firstChild = newChild;
    } else {
      refChild._previousSibling._nextSibling = newChild;
    }
    newChild._previousSibling = refChild._previousSibling;
    refChild._previousSibling = newChild;
    newChild._nextSibling = refChild;
    newChild._parent = this;
  }

  appendChild(newChild: LynxBackgroundElement): void {
    if (!this.firstChild) {
      this.firstChild = newChild;
      this.lastChild = newChild;
    } else {
      if (!this.lastChild) {
        throw new Error(
          'Invariant violation: lastChild is null while firstChild is not null.',
        );
      }
      this.lastChild._nextSibling = newChild;
      newChild._previousSibling = this.lastChild;
      this.lastChild = newChild;
    }
    newChild._parent = this;
  }

  addClass(name: string): void {
    this.classes.add(name);
  }
  removeClass(name: string): void {
    this.classes.delete(name);
  }
  remove(): void {
    if (!this._parent) {
      return;
    }
    if (this._previousSibling) {
      this._previousSibling._nextSibling = this._nextSibling;
    } else {
      this._parent.firstChild = this._nextSibling;
    }
    if (this._nextSibling) {
      this._nextSibling._previousSibling = this._previousSibling;
    } else {
      this._parent.lastChild = this._previousSibling;
    }
    this._nextSibling = null;
    this._previousSibling = null;
    this._parent = null;
  }

  parentNode(): BaseLynxElement | null {
    return this._parent;
  }
  nextSibling(): BaseLynxElement | null {
    return this._nextSibling;
  }
  querySelector(_selector: string): BaseLynxElement | null {
    throw new Error('Method not implemented.');
  }
  querySelectorAll(_selector: string): BaseLynxElement[] {
    throw new Error('Method not implemented.');
  }
  addEventListener(name: string, cb: (event: any) => any): () => void {
    this.events.set(name, cb);
    return () => {
      this.events.delete(name);
    };
  }
}

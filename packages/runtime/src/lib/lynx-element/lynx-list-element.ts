import type { ElementRef } from '../types/lynx';
import { LynxElement } from './lynx-element';

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
export function setPageElement(el: ElementRef): void {
  _pageElement = el;
}

/**
 * Process all pending list updates. Called from LynxRendererFactory2.end()
 * before __FlushElementTree() so list updates are flushed as part of the
 * normal Angular CD cycle — never from setTimeout (which crashes native).
 */
export function processPendingListUpdates(): void {
  if (pendingListUpdates.size === 0) return;
  // Copy & clear before iterating — a processUpdate could theoretically
  // trigger further mutations, though unlikely.
  const lists = [...pendingListUpdates];
  pendingListUpdates.clear();
  for (const list of lists) {
    list._processUpdate();
  }
}

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

import type { ElementRef } from '../types/lynx';
import { LynxElement } from './lynx-element';

/**
 * Manages list children in a virtual tree instead of the native element tree.
 *
 * Lynx's native list is a virtualized list driven by engine callbacks
 * (componentAtIndex / enqueueComponent). Children must NOT be appended via
 * __AppendElement at render time — the list calls componentAtIndex to request
 * items by index on demand, and update-list-info tells it which indices exist.
 *
 * Angular's rendering model appends children directly, so this class intercepts
 * appendChild/insertBefore and stores children in a JS-level linked list.
 * The actual __AppendElement call happens lazily inside componentAtIndex
 * (create-list-element.ts) when the native engine requests the item.
 */

// Module-level set of LynxListElements that need their native list updated.
// Drained by processPendingListUpdates() which is called from
// LynxRendererFactory2.end() — right before __FlushElementTree().
const pendingListUpdates = new Set<LynxListElement>();

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
  #firstVirtualChild: LynxElement | null = null;
  #lastVirtualChild: LynxElement | null = null;
  readonly #nonElements: WeakSet<ElementRef>;
  #destroyed = false;
  // Tracks which list-item elements have been appended to the native list tree.
  // We append once (lazily in componentAtIndex) and never again —
  // __AppendElement is not idempotent.
  #appendedToNativeList = new WeakSet<ElementRef>();
  // Tracks what was last committed to native via update-list-info so we can
  // compute a diff (insertAction / removeAction) on the next update.
  #committedUIChildren: ElementRef[] = [];

  constructor(element: ElementRef, nonElements: WeakSet<ElementRef>) {
    super(element);
    this.#nonElements = nonElements;
  }

  /** Store the list callbacks so they can be re-registered before each flush. */
  setCallbacks(
    _componentAtIndex: any,
    _enqueueComponent: any,
    _componentAtIndexes: any,
  ): void {
    // Callbacks are stored by the native engine via __CreateList; we don't
    // need to keep a JS-side reference. This method exists so the factory
    // can signal that setup is complete.
  }

  override remove(): void {
    this.#destroyed = true;
    pendingListUpdates.delete(this);
    super.remove();
  }

  override appendChild(newChild: LynxElement): void {
    if (newChild._isRootPageElement) return;
    newChild._virtualParent = this;
    newChild._virtualPrev = this.#lastVirtualChild;
    newChild._virtualNext = null;

    if (this.#lastVirtualChild) {
      this.#lastVirtualChild._virtualNext = newChild;
    }
    if (!this.#firstVirtualChild) {
      this.#firstVirtualChild = newChild;
    }
    this.#lastVirtualChild = newChild;

    this.#scheduleUpdate();
  }

  override insertBefore(
    newChild: LynxElement,
    refChild: LynxElement | null,
  ): void {
    if (newChild._isRootPageElement) return;
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
      this.#firstVirtualChild = newChild;
    }
    refChild._virtualPrev = newChild;

    this.#scheduleUpdate();
  }

  removeVirtualChild(child: LynxElement): void {
    if (child._virtualPrev) {
      child._virtualPrev._virtualNext = child._virtualNext;
    } else {
      this.#firstVirtualChild = child._virtualNext;
    }
    if (child._virtualNext) {
      child._virtualNext._virtualPrev = child._virtualPrev;
    } else {
      this.#lastVirtualChild = child._virtualPrev;
    }

    child._virtualParent = null;
    child._virtualPrev = null;
    child._virtualNext = null;

    // Do NOT call __RemoveElement here. List item removal is managed
    // exclusively through update-list-info's removeAction (sent in
    // _processUpdate). Direct __RemoveElement on list children is invalid —
    // same as direct __AppendElement outside componentAtIndex crashes.
    // Calling both __RemoveElement AND removeAction double-removes and crashes.

    this.#scheduleUpdate();
  }

  /** Returns ElementRefs of real UI children (excludes NoneElements / comment markers). */
  getUIChildren(): ElementRef[] {
    const children: ElementRef[] = [];
    let child = this.#firstVirtualChild;
    while (child) {
      if (!this.#nonElements.has(child.element)) {
        children.push(child.element);
      }
      child = child._virtualNext;
    }
    return children;
  }

  isAppendedToNativeList(child: ElementRef): boolean {
    return this.#appendedToNativeList.has(child);
  }

  markAppendedToNativeList(child: ElementRef): void {
    this.#appendedToNativeList.add(child);
  }

  /**
   * Mark this list for update. The actual processing happens in
   * processPendingListUpdates(), called from LynxRendererFactory2.end()
   * right before __FlushElementTree(). This ensures list updates are
   * flushed as part of the normal Angular CD cycle — calling
   * __FlushElementTree from setTimeout crashes the native engine.
   */
  #scheduleUpdate(): void {
    if (this.#destroyed) return;
    const wasEmpty = pendingListUpdates.size === 0;
    pendingListUpdates.add(this);
    if (wasEmpty) {
      // Safety net for cases where list items are created outside a begin/end
      // CD cycle (e.g. lazy-loaded route components on first navigation).
      // If end() drains the set first, this microtask is a no-op.
      // IMPORTANT: Only call processPendingListUpdates() here — NOT bare
      // __FlushElementTree(). _processUpdate() does its own targeted flush
      // per list. Bare __FlushElementTree() crashes intermittently when
      // processing lists with update-list-info.
      queueMicrotask(() => {
        if (pendingListUpdates.size > 0) {
          processPendingListUpdates();
        }
      });
    }
  }

  /**
   * Compute a diff against the last committed children and send update-list-info.
   * Called from processPendingListUpdates() — NOT directly.
   * __FlushElementTree() is called afterwards by the renderer factory.
   *
   * Positions in insertAction are indices in the NEW child array.
   * Positions in removeAction are indices in the OLD (committed) child array.
   * This matches the React Lynx ListUpdateInfoRecording format.
   */
  _processUpdate(): void {
    if (this.#destroyed) return;
    const g = globalThis as any;
    g.__dbg = `${g.__dbg || ''}procUpd\n`;
    const newChildren = this.getUIChildren();
    const oldChildren = this.#committedUIChildren;
    g.__dbg += `kids:new=${newChildren.length},old=${oldChildren.length}\n`;

    const oldSet = new Set(oldChildren);
    const newSet = new Set(newChildren);

    // Items present in old but absent from new → tell native to remove them.
    const removeAction: number[] = [];
    for (let i = 0; i < oldChildren.length; i++) {
      if (!newSet.has(oldChildren[i]!)) {
        removeAction.push(i);
      }
    }

    // Items present in new but absent from old → tell native to insert them.
    // Minimal insertAction format matching Vue Lynx: only position, type, item-key.
    const insertAction = newChildren
      .map((child, i) => ({ child, i }))
      .filter(({ child }) => !oldSet.has(child))
      .map(({ child, i }) => ({
        position: i,
        type: 'list-item',
        'item-key':
          __GetAttributeByName(child, 'item-key') ??
          String(__GetElementUniqueID(child)),
      }));

    // CRITICAL: Never send empty update-list-info. Vue Lynx skips updates
    // when there's nothing new (flushListUpdates checks items.length <= reported).
    // Sending an empty update puts the native list in a bad state that causes
    // subsequent updates with items to crash intermittently.
    if (insertAction.length === 0 && removeAction.length === 0) {
      g.__dbg += 'skip-empty\n';
      this.#committedUIChildren = newChildren;
      return;
    }

    // Clean up _appendedToNativeList for removed items so they can be
    // re-appended fresh if re-added to the list later.
    for (const idx of removeAction) {
      const removed = oldChildren[idx];
      if (removed) this.#appendedToNativeList.delete(removed);
    }

    g.__dbg += `setULI:ins=${insertAction.length},rem=${removeAction.length}\n`;
    __SetAttribute(this.element, 'update-list-info', {
      insertAction,
      removeAction,
      updateAction: [],
    });
    g.__dbg += 'ULI-set\n';

    // Targeted flush on the list element. Bare __FlushElementTree() crashes
    // intermittently when processing lists. Targeted flush is safe.
    const listID = __GetElementUniqueID(this.element);
    g.__dbg += `tFlush:listID=${listID}\n`;
    __FlushElementTree(this.element, { triggerLayout: true, listID });
    g.__dbg += 'tFlushed\n';

    // Clear update-list-info after targeted flush so the bare
    // __FlushElementTree() in end() doesn't re-process stale list data
    // on the next CD cycle. The targeted flush already consumed the update.
    __SetAttribute(this.element, 'update-list-info', {
      insertAction: [],
      removeAction: [],
      updateAction: [],
    });

    this.#committedUIChildren = newChildren;
  }
}

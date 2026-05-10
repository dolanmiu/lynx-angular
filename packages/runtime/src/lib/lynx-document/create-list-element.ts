import { LynxListElement } from '../lynx-element';
import type { ElementRef, ListElementRef } from '../types/lynx';

/**
 * Factory for the x-list native element.
 *
 * x-list in Lynx is a virtualized list driven by engine callbacks.
 * Angular's rendering builds children into a virtual JS-level linked list
 * (LynxListElement). The native engine calls componentAtIndex for each
 * visible index; we append the pre-built element and flush with asyncFlush.
 *
 * CRITICAL: This Lynx engine version crashes intermittently on re-entrant
 * synchronous __FlushElementTree calls. componentAtIndex runs DURING the
 * outer __FlushElementTree() in end(). To avoid re-entrancy, we use
 * { asyncFlush: true } which delegates flush scheduling to the native
 * engine. This is the same flag React Lynx uses in its batch path.
 */
export const createListElement = (
  pageId: number,
  nonElements: WeakSet<ElementRef>,
): LynxListElement => {
  // Forward-declared so callbacks can close over the fully-initialized instance.
  let listEl: LynxListElement;

  // componentAtIndex is called by the native engine during the targeted
  // __FlushElementTree(listElement, ...) in _processUpdate(). We append the
  // pre-built element and return its ID. No per-item flush — the element
  // subtree was already committed by the bare __FlushElementTree() in end()
  // which runs BEFORE processPendingListUpdates().
  const componentAtIndex = (
    listRef: ListElementRef,
    _listId: number,
    cellIndex: number,
    _opId: number,
  ): number | undefined => {
    const uiChildren = listEl.getUIChildren();
    if (cellIndex >= uiChildren.length) return undefined;
    const child = uiChildren[cellIndex]!;
    if (!listEl.isAppendedToNativeList(child)) {
      __AppendElement(listRef, child);
      listEl.markAppendedToNativeList(child);
    }
    return __GetElementUniqueID(child);
  };

  const enqueueComponent = (
    _listRef: ListElementRef,
    _listId: number,
    _eleId: number,
  ) => {
    // enqueueComponent signals that an item scrolled offscreen and can be
    // recycled. We don't implement a recycle pool — items stay in the native
    // list tree permanently.
  };

  // Batch version called by the native engine when it needs multiple items.
  // Same no-flush approach as componentAtIndex — items are already committed.
  // If the engine passes asyncFlush: true, we use it since that path delegates
  // scheduling to native (no re-entrancy). The !asyncFlush batch path collects
  // all elementIDs and does a single non-re-entrant flush at the end.
  const componentAtIndexes = (
    listRef: ListElementRef,
    listId: number,
    cellIndexes: number[],
    opIds: number[],
    _enableReuseNotification: boolean,
    asyncFlush: boolean,
  ) => {
    const uiChildren = listEl.getUIChildren();
    const elementIDs: number[] = [];
    for (let i = 0; i < cellIndexes.length; i++) {
      const child = uiChildren[cellIndexes[i]!];
      if (!child) continue;
      if (!listEl.isAppendedToNativeList(child)) {
        __AppendElement(listRef, child);
        listEl.markAppendedToNativeList(child);
      }
      const elementID = __GetElementUniqueID(child);
      elementIDs.push(elementID);
      if (asyncFlush) {
        // Native engine owns the async schedule — safe, no re-entrancy.
        __FlushElementTree(child, { asyncFlush: true });
      }
    }
    if (!asyncFlush) {
      __FlushElementTree(listRef, {
        triggerLayout: true,
        operationIDs: opIds,
        elementIDs,
        listID: listId,
      });
    }
  };

  const nativeList = __CreateList(
    pageId,
    componentAtIndex,
    enqueueComponent,
    {},
    componentAtIndexes,
  );

  // list-type, span-count, and scroll-orientation should be set via template
  // bindings (e.g. <x-list list-type="single" span-count="1" ...>), NOT
  // programmatically here. Vue Lynx does not set any attributes after
  // __CreateList — they flow through the normal attribute-setting path.

  listEl = new LynxListElement(nativeList, nonElements);
  listEl.setCallbacks(componentAtIndex, enqueueComponent, componentAtIndexes);
  return listEl;
};

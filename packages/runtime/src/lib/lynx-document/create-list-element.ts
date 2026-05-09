import { LynxListElement } from '../lynx-element';
import type { ElementRef, ListElementRef } from '../types/lynx';

/**
 * Factory for the x-list native element.
 *
 * x-list in Lynx is a virtualized list driven by engine callbacks.
 * Angular's rendering calls LynxListElement.appendChild() for each child;
 * we intercept this and store children in a virtual JS-level linked list.
 *
 * _scheduleUpdate pre-appends all children to the native list tree, sets
 * update-list-info, then calls __FlushElementTree() to trigger rendering.
 * The engine calls componentAtIndex for each visible index; we just return
 * the element ID since children are already appended.
 *
 * NOTE: React Lynx appends + flushes per-item inside componentAtIndex,
 * but that causes re-entrant __FlushElementTree crashes when triggered
 * from setTimeout (Angular's async scheduling). Pre-appending avoids this
 * because Angular already fully builds all children before the list update.
 */
export function createListElement(
  pageId: number,
  nonElements: WeakSet<ElementRef>,
): LynxListElement {
  // Forward-declared so componentAtIndex closure can reference it
  let listEl: LynxListElement;

  // Deferred flush queue — populated inside componentAtIndex, drained by
  // a microtask that runs after the outer page-level flush completes.
  // This avoids the re-entrant __FlushElementTree crash (calling flush
  // while the engine is already inside a flush triggering componentAtIndex).
  let flushScheduled = false;
  const pendingItemFlushes: Array<() => void> = [];

  const componentAtIndex = (
    _listRef: ListElementRef,
    listId: number,
    cellIndex: number,
    opId: number,
  ) => {
    (globalThis as any).__dbg =
      ((globalThis as any).__dbg || '') + `cAI:cell=${cellIndex},op=${opId}\n`;
    const uiChildren = listEl.getUIChildren();
    if (cellIndex < uiChildren.length) {
      const child = uiChildren[cellIndex];
      // Use _listRef (engine-provided) not the stored listEl.element —
      // React Lynx always appends to the ref the engine passes in.
      if (!listEl.isAppendedToNativeList(child)) {
        __AppendElement(_listRef, child);
        listEl.markAppendedToNativeList(child);
      }
      const elementID = __GetElementUniqueID(child);
      // Queue the per-item flush to run after the outer page-level flush
      // completes. Calling __FlushElementTree synchronously here (re-entrant)
      // crashes the engine ~50% of the time.
      pendingItemFlushes.push(() => {
        // No operationID — it's a one-time token from the engine's componentAtIndex
        // call. By the time this microtask fires, the opId is stale and passing it
        // crashes the engine ~50% of the time. elementID + listID are sufficient.
        __FlushElementTree(child, {
          triggerLayout: true,
          operationID: opId,
          elementID,
          listID: listId,
        });
      });
      if (!flushScheduled) {
        flushScheduled = true;
        queueMicrotask(() => {
          flushScheduled = false;
          const toFlush = pendingItemFlushes.splice(0);
          for (const fn of toFlush) fn();
        });
      }
      return elementID;
    }
    return undefined;
  };

  const enqueueComponent = (
    _listRef: ListElementRef,
    _listId: number,
    _eleId: number,
  ) => {
    // enqueueComponent signals that the native list is done with an item
    // (i.e., it scrolled off-screen and can be recycled). We don't implement
    // a recycle pool — items stay in the native list tree permanently.
  };

  // Batch version of componentAtIndex — the native engine may call this
  // instead of the single-item version. Required as 5th arg to __CreateList
  // (React Lynx always provides it, see list.ts componentAtIndexFactory).
  const componentAtIndexes = (
    listRef: ListElementRef,
    listId: number,
    cellIndexes: number[],
    opIds: number[],
  ) => {
    (globalThis as any).__dbg =
      ((globalThis as any).__dbg || '') +
      `cAIbatch:${JSON.stringify(cellIndexes)}\n`;
    for (let i = 0; i < cellIndexes.length; i++) {
      componentAtIndex(listRef, listId, cellIndexes[i]!, opIds[i]!);
    }
  };

  // Test mock signature: __CreateList(pageId, componentAtIndex, enqueueComponent, componentAtIndexes)
  // — 4 args, NO info object. The type declaration has info as 4th and componentAtIndexes
  // as 5th, but the real native engine may match the test mock (4 args).
  // Passing {} as 4th arg means componentAtIndexes is never registered.
  const nativeList = __CreateList(
    pageId,
    componentAtIndex,
    enqueueComponent,
    componentAtIndexes as any,
  );

  // list-type, span-count, and scroll-orientation are all required by the
  // native list engine (per Lynx docs). Without them the native side crashes
  // at render time. Defaults to a single-column vertical list; users can
  // override via template attributes.
  __SetAttribute(nativeList, 'list-type', 'single');
  __SetAttribute(nativeList, 'span-count', 1);
  __SetAttribute(nativeList, 'scroll-orientation', 'vertical');

  listEl = new LynxListElement(nativeList, nonElements);
  listEl.setCallbacks(componentAtIndex, enqueueComponent, componentAtIndexes);
  return listEl;
}

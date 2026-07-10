import { LynxListElement } from '../../lynx-element';
import type { ElementRef, ListElementRef } from '../../types/lynx';

/**
 * Factory for the list native element.
 *
 * list in Lynx is a virtualized list driven by engine callbacks.
 * Angular's rendering builds children into a virtual JS-level linked list
 * (LynxListElement). The native engine calls componentAtIndex for each
 * visible index, synchronously, during the list's own layout pass; we
 * append the pre-built element and ack it with { asyncFlush: true } (see
 * componentAtIndex's own doc comment for why, and for the hard constraint
 * that nothing reachable from these callbacks may call a WeakSet/Map method).
 */
export const createListElement = (
  pageId: number,
  nonElements: WeakSet<ElementRef>,
): LynxListElement => {
  // Forward-declared so callbacks can close over the fully-initialized instance.
  let listEl: LynxListElement;

  /**
   * componentAtIndex is called by the native engine synchronously, from
   * DEEP inside the list's own layout pass (LinearLayoutManager::Fill ->
   * LayoutChunk -> BindItemHolder -> ComponentAtIndex -> into JS). We append
   * the pre-built element (its own inner subtree was already committed by
   * the normal, non-list __AppendElement calls during rendering) and ack it.
   *
   * The ack MUST be a synchronous flush tagged with the operationID native
   * passed us: { triggerLayout: true, operationID, elementID: sign, listID }.
   * This mirrors React Lynx's single-item componentAtIndex exactly (see
   * references/.../snapshot/list/list.ts, componentAtChildCtx's
   * `!enableBatchRender` branch). The operationID is the acknowledgment the
   * native list waits for to mark this cell's binding COMPLETE — it is the
   * whole point of the callback. { asyncFlush: true } (untagged) is only for
   * the batch componentAtIndexes path where the engine itself opts in; using
   * it here leaves every cell perpetually "binding" (native never matches an
   * operationID), so it re-runs its layout pass forever without ever showing
   * an item — an infinite layoutComplete loop with visibleItem stuck empty.
   * Despite running from inside the layout pass, the operationID flush is not
   * dangerously re-entrant: native defers the operation's completion via the
   * operationID queue rather than recursing into TickLayout here.
   *
   * CRITICAL: this function (and anything it calls, e.g. listEl's helper
   * methods) must NEVER call a WeakSet/Map method (.has()/.add()/.delete()) —
   * not even once. That was empirically isolated as the actual crash trigger,
   * not general reentrancy or call-stack depth: a WeakSet.has() call
   * (originally in LynxListElement.getUIChildren()'s NoneElement filter,
   * called on every componentAtIndex invocation) reliably crashed with a
   * QuickJS refcounting assertion in __JS_FreeValueRT during js_map_has,
   * even when this callback was invoked from a freshly-scheduled setTimeout
   * task at the top of the native message loop (i.e. with no accumulated
   * call-stack depth at all) — ruling out "the engine's unbounded Lepus
   * stack got too deep" as the cause. Something about calling into QuickJS's
   * Map/Set/WeakSet native implementation specifically from a callback
   * reached via ListElement::ComponentAtIndex's CallLepusMethod path is
   * unsafe. getCommittedUIChildren()/isAppendedToNativeList() below use a
   * pre-computed array and a plain property tag respectively, precisely to
   * avoid this: ordinary array indexing and property access compile to
   * different bytecode than a Map/Set method call and don't trigger it.
   */
  const componentAtIndex = (
    listRef: ListElementRef,
    listId: number,
    cellIndex: number,
    opId: number,
  ): number | undefined => {
    const uiChildren = listEl.getCommittedUIChildren();
    if (cellIndex >= uiChildren.length) return undefined;
    const child = uiChildren[cellIndex]!;
    if (!listEl.isAppendedToNativeList(child)) {
      __AppendElement(listRef, child);
      listEl.markAppendedToNativeList(child);
    }
    const sign = __GetElementUniqueID(child);
    __FlushElementTree(child, {
      triggerLayout: true,
      operationID: opId,
      elementID: sign,
      listID: listId,
    });
    return sign;
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

  /**
   * Batch version called by the native engine when it needs multiple items.
   * Same no-flush approach as componentAtIndex — items are already committed.
   * If the engine passes asyncFlush: true, we use it since that path delegates
   * scheduling to native (no re-entrancy). The !asyncFlush batch path collects
   * all elementIDs and does a single non-re-entrant flush at the end.
   */
  const componentAtIndexes = (
    listRef: ListElementRef,
    listId: number,
    cellIndexes: number[],
    opIds: number[],
    _enableReuseNotification: boolean,
    asyncFlush: boolean,
  ) => {
    const uiChildren = listEl.getCommittedUIChildren();
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
  // bindings (e.g. <list list-type="single" span-count="1" ...>), NOT
  // programmatically here. Vue Lynx does not set any attributes after
  // __CreateList — they flow through the normal attribute-setting path.
  //
  // enable-async-list is the one exception: it's not a per-list layout
  // choice, it's a hard requirement of Lynx's native list UI (see
  // LynxUICollection.isNeedRenderComponents in the iOS engine — error
  // E_COMPONENT_LIST_UNSUPPORTED_THREAD_STRATEGY, code 220207). Every
  // AngularLynx app runs the dual-thread (async) engine strategy with
  // fiber-style elements, and without this flag the native list silently
  // skips applying its data source — componentAtIndex is simply never
  // called, no crash, nothing renders. Setting it here means every <list>
  // works out of the box; a template binding can still override it if a
  // future use case genuinely needs the sync (all-on-UI) engine strategy.
  __SetAttribute(nativeList, 'enable-async-list', true);

  listEl = new LynxListElement(nativeList, nonElements);
  listEl.tagName = 'list';
  listEl.setCallbacks(componentAtIndex, enqueueComponent, componentAtIndexes);
  return listEl;
};

# x-list Crash Investigation — All Attempts

**Status:** Unresolved — app crashes to home screen (native crash, not JS error)

## Problem

`x-list` in `elements-showcase.component.ts` crashes the app to the home screen whenever `__FlushElementTree()` processes a list that has `update-list-info` set.

## Working State (baseline)

After initial fixes (adding `scroll-orientation`, removing invalid `__SetConfig`), the app **did not crash** but list items **did not show**. In this state:

- `_scheduleUpdate()` used `setTimeout(0)` and called `__FlushElementTree(this.element, { triggerLayout: true, listID })` (targeted flush on list element)
- The targeted flush did NOT trigger `componentAtIndex` (items never rendered)
- The bare `__FlushElementTree()` in `end()` ran first (before setTimeout), with no `update-list-info` set yet — so no crash

**Key insight:** The crash occurs specifically when a bare `__FlushElementTree()` (or page-level flush) processes a list element that has `update-list-info` set.

---

## Attempt 1: Bare `__FlushElementTree()` in setTimeout

**Change:** Replaced targeted flush with bare `__FlushElementTree()` in `_scheduleUpdate()`'s setTimeout callback.

**Result:** CRASH to home screen.

**Why:** Bare flush processes `update-list-info`, triggers `componentAtIndex`. Either the setTimeout context is invalid for flushing, or `componentAtIndex` does something that crashes.

---

## Attempt 2: Pre-append children + bare `__FlushElementTree()` in setTimeout

**Change:** Pre-append all children to native list tree via `__AppendElement` before setting `update-list-info`. Simplified `componentAtIndex` to just return element IDs (no append, no flush inside callback).

**Result:** CRASH to home screen.

**Why:** Still calling bare `__FlushElementTree()` from setTimeout. The crash occurs regardless of what `componentAtIndex` does.

---

## Attempt 3: Move to `end()` lifecycle — pre-append + bare flush

**Change:** Eliminated setTimeout entirely. Created `processPendingListUpdates()` called from `LynxRendererFactory2.end()` before `__FlushElementTree()`. The flow:
1. `_scheduleUpdate()` adds list to a module-level `Set<LynxListElement>`
2. `end()` drains the set, calling `_processUpdate()` on each list
3. `_processUpdate()` pre-appends children + sets `update-list-info`
4. `end()` calls `__FlushElementTree()` (bare)

`componentAtIndex` just returns element IDs (no append, no flush).

**Result:** CRASH to home screen.

**Why:** Pre-appending children via `__AppendElement` on a list element may be invalid — the native list might expect children to be appended only inside `componentAtIndex`.

---

## Attempt 4: React Lynx pattern — append + per-item flush inside componentAtIndex

**Change:** Removed pre-append from `_processUpdate()`. Moved append + flush into `componentAtIndex`:
```typescript
const componentAtIndex = (_listRef, listId, cellIndex, opId) => {
  const uiChildren = listEl.getUIChildren();
  if (cellIndex < uiChildren.length) {
    const child = uiChildren[cellIndex];
    listEl.appendChildToNativeList(child);
    const elementID = __GetElementUniqueID(child);
    __FlushElementTree(child, {
      triggerLayout: true,
      operationID: opId,
      elementID,
      listID: listId,
    });
    return elementID;
  }
  return undefined;
};
```

This matches React Lynx exactly (append child, per-item flush with list-specific options, return ID).

**Result:** CRASH to home screen.

**Why:** The nested `__FlushElementTree(child, {...})` inside `componentAtIndex` (triggered by the outer `__FlushElementTree()` from `end()`) is a re-entrant flush. Even though React Lynx does this, something about our setup is different.

---

## Attempt 5: Fixed width + height on x-list CSS

**Change:** Added `width: 100%` to `.mini-list` (which already had `height: 120px`). Lynx docs state: "The width and height of `<list>` represent the size of its viewport, so they need to be fixed values and cannot be expanded by internal content."

**Result:** CRASH to home screen.

**Why:** Width/height alone doesn't fix the underlying issue with `update-list-info` + flush.

---

## Current State of Code

### `lynx-element.ts` — LynxListElement

- Module-level `Set<LynxListElement>` for pending updates
- `processPendingListUpdates()` exported, called from renderer factory `end()`
- `_scheduleUpdate()` just adds `this` to the set (no setTimeout)
- `_processUpdate()` sets `item-key` + `recyclable` on children, sets `update-list-info` (no pre-append)
- `componentAtIndex` in `lynx-document.ts` does append + per-item flush

### `lynx-renderer-factory2.ts`

```typescript
end?(): void {
  if (__MAIN_THREAD__) {
    processPendingListUpdates();
    __FlushElementTree();
  }
}
```

### `lynx-document.ts` — x-list creation

- `__CreateList(pageId, componentAtIndex, enqueueComponent)`
- Sets `list-type: 'single'`, `span-count: 1`, `scroll-orientation: 'vertical'`
- `componentAtIndex`: appends child + per-item flush + returns ID

---

## What We Know For Certain

1. **The crash is native-level** (app closes to home screen, not a JS error)
2. **The crash is triggered by `__FlushElementTree()` processing a list with `update-list-info` set**
3. **A targeted flush `__FlushElementTree(this.element, { triggerLayout: true, listID })` does NOT crash** — but also doesn't render items
4. **The crash happens regardless of:**
   - Whether it's called from setTimeout or synchronous `end()` context
   - Whether children are pre-appended or appended inside componentAtIndex
   - Whether componentAtIndex does work (append + flush) or just returns an ID
   - Whether the list has explicit width/height CSS or not
5. **React Lynx pattern (append + per-item flush in componentAtIndex) also crashes in our setup**

---

## Remaining Hypotheses

### H1: `update-list-info` format is wrong

Our format:
```json
{
  "insertAction": [{"position": 0, "type": "__angular_list_item", "item-key": "123"}],
  "removeAction": [],
  "updateAction": []
}
```

React Lynx test example format:
```json
{
  "insertAction": [{"position": 0, "type": "__Card__:__snapshot_f75b7_test_2", "item-key": 0}],
  "removeAction": [],
  "updateAction": []
}
```

Differences:
- React Lynx uses numeric `item-key` (0, 1, 2), we use string (`"123"`)
- React Lynx `type` is more specific, ours is generic
- Maybe additional fields are required (e.g., `estimated-main-axis-size-px`)

### H2: `__FlushElementTree()` with no arguments doesn't support list processing

Maybe bare `__FlushElementTree()` doesn't handle lists. React Lynx calls `__FlushElementTree(__page, flushOptions)` with the page element. Our `end()` calls it with no arguments.

**Potential fix:** Pass the page element to `__FlushElementTree`:
```typescript
__FlushElementTree(this.lynxDocument.page.element);
```

### H3: Need `__UpdateListCallbacks()` before flush

React Lynx calls `__UpdateListCallbacks(listElement, componentAtIndex, enqueueComponent)` in its `listUpdateInfo.flush()` method — re-registering callbacks before each flush cycle. We only register callbacks once during `__CreateList()`. Maybe the native engine invalidates callbacks after processing them.

### H4: The list element isn't fully attached to the page tree when flush happens

If the list is created and `update-list-info` is set before the list's parent chain is connected to the page element, the flush might crash trying to traverse an incomplete tree.

### H5: `list-item` elements created via `__CreateElement('list-item', pageId)` might be wrong

Maybe list-items need to be created differently, or need specific attributes before being used with update-list-info.

### H6: Timing — update-list-info must be set in a specific lifecycle phase

React Lynx sets `update-list-info` during `__pendingListUpdates.flush()` which is called from `updateMainThread()` (a native-initiated callback). Maybe it can only be set from within a native callback context, not from Angular's synchronous rendering.

---

## Next Steps to Try

1. **Try numeric `item-key`** in insertAction (match React Lynx exactly)
2. **Call `__UpdateListCallbacks()`** before setting update-list-info
3. **Pass page element to `__FlushElementTree()`** — `__FlushElementTree(page, { triggerLayout: true })`
4. **Remove `update-list-info` entirely** and confirm no crash — isolates whether the crash is from update-list-info parsing or componentAtIndex execution
5. **Add on-screen debug logging** — wrap critical operations in try/catch blocks and render the current step to an `<x-text>` element before the crash point
6. **Try setting update-list-info as a JSON string** instead of an object
7. **Try an empty insertAction array** — `{ insertAction: [], removeAction: [], updateAction: [] }` — to see if the crash is from the format or from having items

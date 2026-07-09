import {
  LynxAnimation,
  type LynxAnimationOptions,
} from '../animation/animation';
import { devStats } from '../devtools/stats';
import { __pageElementRef } from '../lynx-document/page-ref';
import type { ElementRef } from '../types/lynx';
import {
  type BaseLynxElement,
  EVENT_PREFIXES,
  type LynxEventType,
} from './types';

/**
 * True if `el` is an `<overlay>` or has one anywhere in its subtree. Used by
 * remove() to decide whether a subtree is safe to park on the page root during
 * an Angular detach: an orphaned overlay is a live native window with no owning
 * view (see remove() for why that crashes), so overlay-bearing subtrees are torn
 * down for real instead of parked. Walks the native tree via __GetTag; the depth
 * is bounded by the removed subtree, and removals are not on a hot path.
 */
const containsOverlay = (el: ElementRef): boolean => {
  if (__GetTag(el) === 'overlay') return true;
  return __GetChildren(el).some(containsOverlay);
};

export class LynxElement implements BaseLynxElement {
  readonly element: ElementRef;
  tagName = '';

  /**
   * When true, this element is the root page element and must not be
   * re-parented (appendChild/insertBefore) or removed from the tree.
   * Angular calls appendChild/remove as part of normal component lifecycle,
   * but the page element is the immutable root — moving or removing it
   * would corrupt the native element tree.
   */
  isRootPageElement = false;

  /**
   * Virtual tree tracking — used when parent manages children outside the
   * native element tree (e.g., list manages children via componentAtIndex
   * callbacks rather than __AppendElement)
   */
  _virtualParent: LynxElement | null = null;
  _virtualPrev: LynxElement | null = null;
  _virtualNext: LynxElement | null = null;

  // Tracks IDs of animations started on this element via animate().
  // Canceled in remove() to clear stale animation state from Lynx's native
  // element pool — without this, pooled elements retain animation values
  // (e.g. opacity: 0) that poison newly-created elements reusing the slot.
  #activeAnimationIds: string[] = [];

  constructor(element: ElementRef) {
    this.element = element;
  }

  setProperty(name: string, value: any): void {
    this.setAttribute(name, value);
  }
  setAttribute(name: string, value: any): void {
    if (name === 'class') {
      // Use __SetClasses (not __AddClass) because setAttribute replaces the
      // entire class attribute with a space-separated list. __AddClass treats
      // its argument as a single class name — passing 'foo bar baz' would set
      // the literal class 'foo bar baz' rather than three separate classes,
      // so no CSS rule would ever match. __SetClasses correctly parses the
      // space-separated list. This matches how React Lynx handles className.
      __SetClasses(this.element, value ?? '');
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
    if (newChild.isRootPageElement) return;
    if (refChild == null) {
      this.appendChild(newChild);
    } else {
      __InsertElementBefore(this.element, newChild.element, refChild.element);
    }
  }

  appendChild(newChild: LynxElement): void {
    if (newChild.isRootPageElement) return;
    __AppendElement(this.element, newChild.element);
  }

  addClass(name: string): void {
    __AddClass(this.element, name);
  }

  /**
   * Lynx has no __RemoveClass PAPI — we must get current classes, filter,
   * and set back. This is O(n) per class removal but class lists on Lynx
   * elements are typically small (1-5 classes for scope/component styling).
   */
  removeClass(name: string): void {
    const classes = __GetClasses(this.element).filter((c) => c !== name);
    __SetClasses(this.element, classes.join(' '));
  }

  /**
   * Two distinct removal paths:
   * 1. Virtual parent (list) → delegate to removeVirtualChild(), which updates
   *    the JS linked list and schedules an update-list-info diff. Does NOT call
   *    __RemoveElement — list item removal is managed exclusively through
   *    update-list-info's removeAction (calling both would double-remove and crash).
   * 2. Normal parent → __RemoveElement detaches from the native element tree.
   *    Note: __RemoveElement does NOT free the element's native pool slot —
   *    there is no __ReleaseElement in Lynx's PAPI.
   */
  remove() {
    if (this.isRootPageElement) return;
    if (__PROFILE__) devStats.elementRemoved++;
    if (this._virtualParent) {
      const vp = this._virtualParent as any;
      if (typeof vp.removeVirtualChild === 'function') {
        vp.removeVirtualChild(this);
      }
      return;
    }
    const parent = this.parentNode();
    if (!parent) {
      return;
    }
    // Cancel all active animations and reset animated properties before removal.
    // Lynx's native element pool reuses elements — if an animation is still
    // running (or fill:'forwards' persists the final frame), the stale animation
    // state transfers to whatever new element reuses this pool slot.
    // Canceling + resetting inline styles ensures the pooled element returns clean.
    // Wire protocol constant 3 = ANIMATION_CANCEL (from animation.ts).
    // Canceling a completed animation is harmless — a no-op at the native level.
    for (const id of this.#activeAnimationIds) {
      __ElementAnimate(this.element, [3, id]);
    }
    if (this.#activeAnimationIds.length > 0) {
      // Cancel clears the animation's active effect, but Lynx may leave
      // residual computed values on the element (observed: opacity stays at
      // the initial keyframe value 0 after cancel). Nulling the inline styles
      // forces a full reset so the pooled element has no lingering overrides.
      __AddInlineStyle(this.element, 'opacity', null);
      __AddInlineStyle(this.element, 'transform', null);
      this.#activeAnimationIds.length = 0;
    }
    // Park children at the page root before removing this element. On Lynx,
    // elements trapped inside a removed subtree become permanently dead and
    // can never be re-attached to a new parent. By moving children to the
    // page root first, they stay alive in the native tree and can be moved
    // to a new parent later (e.g. projected content re-projected by @if).
    //
    // Exception: never park a subtree that contains an <overlay>. Angular's
    // detach pass removes only a subtree's root and relies on us to keep the
    // rest alive — but an <overlay> is a standalone native window, not an
    // in-flow element. Orphaning one on the page root leaves a live window with
    // no owning Angular view, which corrupts the native window hierarchy on
    // teardown (observed: crash to home screen when an @if that contains a
    // select/sheet/dialog is destroyed). Overlays are always mounted and
    // shown/hidden via their `visible` attribute — never re-projected through
    // @if — so they never need parking to survive. Remove such subtrees for
    // real instead, so the overlay window is properly torn down.
    //
    // Second exception: never pick apart the children of a <block> being
    // removed. <block> is backed by __CreateWrapperElement, a "layout-only"
    // native element — its children have no native UI subtree of their own,
    // they're flattened directly into the nearest real ancestor at the
    // painting layer. Yanking them out individually here (leaving the wrapper
    // momentarily childless before it too is removed) breaks that flatten
    // bookkeeping — same "crash to home screen" symptom as the overlay case
    // above, just via a different native mechanism. <block> exists for
    // conditional grouping with no visual output, not content preservation
    // across toggles, so removing its whole subtree in one shot (rather than
    // parking each child) loses nothing a <block> user relies on. Callers
    // that need projected content to survive an @if toggle should wrap it in
    // a <view> instead, which keeps the normal (non-flattened) parking path.
    if (__pageElementRef && this.tagName !== 'block') {
      for (const child of __GetChildren(this.element)) {
        if (containsOverlay(child)) {
          __RemoveElement(this.element, child);
        } else {
          __AppendElement(__pageElementRef, child);
        }
      }
    }
    __RemoveElement((parent as LynxElement).element, this.element);
  }

  /**
   * Returns the parent element. For list children, the virtual parent (the JS
   * LynxListElement) is returned instead of the native parent — this maintains
   * the illusion that list children are parented by the list even though they
   * may not be __AppendElement'd to the native list yet (lazy append in
   * componentAtIndex).
   */
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
  /**
   * Invokes a native UI method on this element by name.
   *
   * This is needed because some Lynx native elements expose behavior only
   * through UIMethod calls and have no corresponding @LynxProp handler. The
   * most common case is input/textarea text updates: the native
   * LynxUIBaseInput class has no @LynxProp for "value", so __SetAttribute
   * is a no-op for changing the displayed text after user interaction. The
   * setValue UIMethod is the only way to programmatically update the live
   * text.
   *
   * The result callback is intentionally empty. Callers that need a result
   * (e.g. getValue, boundingClientRect) should use MainThreadElement.invoke(),
   * which returns a Promise. This method covers fire-and-forget cases like
   * setValue where only the side-effect matters.
   */
  invoke(methodName: string, params?: Record<string, unknown>): void {
    __InvokeUIMethod(this.element, methodName, params ?? {}, () => {});
  }

  animate(
    keyframes: Record<string, string | number>[],
    options?: number | LynxAnimationOptions,
  ): LynxAnimation {
    const normalizedOptions =
      typeof options === 'number' ? { duration: options } : (options ?? {});
    const anim = new LynxAnimation(this.element, keyframes, normalizedOptions);
    // Track the animation so remove() can cancel it before the element
    // returns to the native pool. Without this, the pool slot retains
    // stale animation state (e.g. opacity stuck at the FROM keyframe).
    this.#activeAnimationIds.push(anim.id);
    return anim;
  }

  /**
   * Angular's renderer.listen() calls this with event names like 'bindtap',
   * 'catchtouchstart', 'bindscroll', etc. We strip the Lynx event prefix
   * (bind/catch/capture-bind/capture-catch) to extract the native event name
   * and determine the event type for __AddEvent.
   * Events that don't match any prefix (e.g. DOM-style 'click') are silently
   * ignored — Lynx has no equivalent event system for arbitrary names.
   */
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

    /**
     * Lynx's background-thread event objects don't implement the DOM-style
     * stopPropagation()/preventDefault() methods. Lynx only exposes them in
     * main-thread scripts, yet its own .d.ts declares them on every event — so
     * TypeScript never catches the gap. Angular templates (and Angular's own
     * listener wrapper, which calls preventDefault() whenever a handler returns
     * false) assume every event has them, so a handler like
     * `$event.stopPropagation()` throws "not a function" at runtime.
     *
     * Propagation in Lynx is controlled statically by the bind/catch event
     * prefix, and there is no runtime default to prevent, so we inject no-op
     * shims — only when missing, to avoid clobbering the real methods that DO
     * exist in main-thread-script contexts. This gives Angular DOM parity:
     * handlers that call these methods run without crashing. We augment the
     * event before invoking cb (Angular's wrapper may call preventDefault()
     * during that call) and return cb's result (the return-false path relies
     * on it). Mirrors React Lynx's addEventMethodsIfNeeded.
     */
    const listener = (event: any) => {
      if (event && typeof event === 'object') {
        if (typeof event.stopPropagation !== 'function') {
          event.stopPropagation = () => {};
        }
        if (typeof event.preventDefault !== 'function') {
          event.preventDefault = () => {};
        }
        if (typeof event.stopImmediatePropagation !== 'function') {
          event.stopImmediatePropagation = () => {};
        }
      }
      return cb(event);
    };

    // type: 'worklet' routes the callback through Lynx's worklet system
    // (runWorklet), which is the only way to receive events in the JS thread.
    // Direct function callbacks also work here (not just worklet handles) —
    // the native engine checks the value type at runtime.
    __AddEvent(this.element, eventType, eventName, {
      type: 'worklet',
      value: listener,
    });

    return () => {
      // Passing undefined as the listener tells the Lynx SDK to remove the
      // corresponding event listener for this type+name combination.
      __AddEvent(this.element, eventType, eventName, undefined);
    };
  }
}

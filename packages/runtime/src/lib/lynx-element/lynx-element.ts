import {
  LynxAnimation,
  type LynxAnimationOptions,
} from '../animation/animation';
import { devStats } from '../devtools/stats';
import type { ElementRef } from '../types/lynx';
import {
  type BaseLynxElement,
  EVENT_PREFIXES,
  type LynxEventType,
} from './types';

export class LynxElement implements BaseLynxElement {
  readonly element: ElementRef;

  // When true, this element is the root page element and must not be
  // re-parented (appendChild/insertBefore) or removed from the tree.
  // Angular calls appendChild/remove as part of normal component lifecycle,
  // but the page element is the immutable root — moving or removing it
  // would corrupt the native element tree.
  isRootPageElement = false;

  // Virtual tree tracking — used when parent manages children outside the
  // native element tree (e.g., list manages children via componentAtIndex
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

  // Lynx has no __RemoveClass PAPI — we must get current classes, filter,
  // and set back. This is O(n) per class removal but class lists on Lynx
  // elements are typically small (1-5 classes for scope/component styling).
  removeClass(name: string): void {
    const classes = __GetClasses(this.element).filter((c) => c !== name);
    __SetClasses(this.element, classes.join(' '));
  }

  // Two distinct removal paths:
  // 1. Virtual parent (list) → delegate to removeVirtualChild(), which updates
  //    the JS linked list and schedules an update-list-info diff. Does NOT call
  //    __RemoveElement — list item removal is managed exclusively through
  //    update-list-info's removeAction (calling both would double-remove and crash).
  // 2. Normal parent → __RemoveElement detaches from the native element tree.
  //    Note: __RemoveElement does NOT free the element's native pool slot —
  //    there is no __ReleaseElement in Lynx's PAPI.
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
    __RemoveElement((parent as LynxElement).element, this.element);
  }

  // Returns the parent element. For list children, the virtual parent (the JS
  // LynxListElement) is returned instead of the native parent — this maintains
  // the illusion that list children are parented by the list even though they
  // may not be __AppendElement'd to the native list yet (lazy append in
  // componentAtIndex).
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
  animate(
    keyframes: Record<string, string | number>[],
    options?: number | LynxAnimationOptions,
  ): LynxAnimation {
    const normalizedOptions =
      typeof options === 'number' ? { duration: options } : (options ?? {});
    return new LynxAnimation(this.element, keyframes, normalizedOptions);
  }

  // Angular's renderer.listen() calls this with event names like 'bindtap',
  // 'catchtouchstart', 'bindscroll', etc. We strip the Lynx event prefix
  // (bind/catch/capture-bind/capture-catch) to extract the native event name
  // and determine the event type for __AddEvent.
  // Events that don't match any prefix (e.g. DOM-style 'click') are silently
  // ignored — Lynx has no equivalent event system for arbitrary names.
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

    // type: 'worklet' routes the callback through Lynx's worklet system
    // (runWorklet), which is the only way to receive events in the JS thread.
    // Direct function callbacks also work here (not just worklet handles) —
    // the native engine checks the value type at runtime.
    __AddEvent(this.element, eventType, eventName, {
      type: 'worklet',
      value: cb,
    });

    return () => {
      // Passing undefined as the listener tells the Lynx SDK to remove the
      // corresponding event listener for this type+name combination.
      __AddEvent(this.element, eventType, eventName, undefined);
    };
  }
}

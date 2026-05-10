import type { ElementRef } from '../types/lynx';
import {
  type BaseLynxElement,
  EVENT_PREFIXES,
  type LynxEventType,
} from './types';

export class LynxElement implements BaseLynxElement {
  readonly element: ElementRef;

  // When true, this element is the root page element and must not be
  // reparented (appendChild/insertBefore) or removed from the tree.
  // Angular calls appendChild/remove as part of normal component lifecycle,
  // but the page element is the immutable root — moving or removing it
  // would corrupt the native element tree.
  _isRootPageElement = false;

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
    if (newChild._isRootPageElement) return;
    if (refChild == null) {
      this.appendChild(newChild);
    } else {
      __InsertElementBefore(this.element, newChild.element, refChild.element);
    }
  }

  appendChild(newChild: LynxElement): void {
    if (newChild._isRootPageElement) return;
    __AppendElement(this.element, newChild.element);
  }

  addClass(name: string): void {
    __AddClass(this.element, name);
  }

  removeClass(name: string): void {
    const classes = __GetClasses(this.element).filter((c) => c !== name);
    __SetClasses(this.element, classes.join(' '));
  }

  remove() {
    if (this._isRootPageElement) return;
    if (this._virtualParent) {
      // Remove from virtual tree (e.g., when parent is an list).
      // Duck-typed to avoid a circular import with LynxListElement.
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

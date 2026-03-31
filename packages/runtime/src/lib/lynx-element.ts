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
  insertBefore(newChild: BaseLynxElement, refChild: BaseLynxElement): void;
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
  readonly #element: ElementRef;
  constructor(element: ElementRef) {
    this.#element = element;
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
      __SetID(this.#element, value);
    } else if (name.startsWith('data-')) {
      const data: Record<string, any> = {};
      const key = name.slice(5);
      data[key] = value;
      __SetDataset(this.#element, data);
    } else {
      __SetAttribute(this.#element, name, value);
    }
  }

  getAttribute(name: string) {
    return __GetAttributeByName(this.#element, name) as string;
  }

  removeAttribute(name: string): void {
    this.setAttribute(name, null);
  }

  setStyle(key: string, value: unknown): void {
    __AddInlineStyle(this.#element, key, value);
  }
  removeStyle(key: string): void {
    __AddInlineStyle(this.#element, key, null);
  }
  setInlineStyles(inlineStyle: string): void {
    __SetInlineStyles(this.#element, inlineStyle);
  }

  insertBefore(newChild: LynxElement, refChild: LynxElement): void {
    __InsertElementBefore(this.#element, newChild.#element, refChild.#element);
  }

  appendChild(newChild: LynxElement): void {
    __AppendElement(this.#element, newChild.#element);
    // should we flush?
  }

  addClass(name: string): void {
    __AddClass(this.#element, name);
  }

  removeClass(name: string): void {
    const classes = __GetClasses(this.#element).filter((c) => c !== name);
    __SetClasses(this.#element, classes.join(' '));
  }

  remove() {
    const parent = this.parentNode();
    if (!parent) {
      return;
    }
    __RemoveElement(parent.#element, this.#element);
  }

  parentNode(): LynxElement | null {
    const parent = __GetParent(this.#element);
    if (!parent) return null;
    return new LynxElement(parent);
  }

  nextSibling(): LynxElement | null {
    const nextSibling = __NextElement(this.#element);
    if (!nextSibling) return null;
    return new LynxElement(nextSibling);
  }

  querySelector(selector: string): LynxElement | null {
    const element = __QuerySelector(this.#element, selector, {});
    if (!element) return null;
    return new LynxElement(element);
  }
  querySelectorAll(selector: string): LynxElement[] {
    return __QuerySelectorAll(this.#element, selector, {}).map(
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

    __AddEvent(this.#element, eventType, eventName, {
      type: 'worklet',
      value: cb,
    });

    return () => {
      const events = __GetEvents(this.#element);
      const filtered = Object.entries(events).reduce<
        Record<string, Record<string, any>>
      >((acc, [key, value]) => {
        if (key !== `${eventType}:${eventName}`) {
          acc[key] = value;
        }
        return acc;
      }, {});
      __SetEvents(this.#element, Object.values(filtered));
    };
  }
}

export class LynxBackgroundElement implements BaseLynxElement {
  #props = new Map<string, any>();
  #styles = new Map<string, any>();
  #classes = new Set<string>();
  #events = new Map<string, (event: any) => any>();
  #parent: LynxBackgroundElement | null = null;
  #firstChild: LynxBackgroundElement | null = null;
  #lastChild: LynxBackgroundElement | null = null;
  #previousSibling: LynxBackgroundElement | null = null;
  #nextSibling: LynxBackgroundElement | null = null;

  setProperty(name: string, value: any): void {
    this.#props.set(name, value);
  }
  setAttribute(name: string, value: any): void {
    this.#props.set(name, value);
  }
  getAttribute(name: string): string | null {
    return this.#props.get(name) ?? null;
  }
  removeAttribute(name: string): void {
    this.#props.delete(name);
  }
  setStyle(key: string, value: unknown): void {
    this.#styles.set(key, value);
  }
  removeStyle(key: string): void {
    this.#styles.delete(key);
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
    refChild: LynxBackgroundElement,
  ): void {
    if (!refChild.#previousSibling) {
      this.#firstChild = newChild;
    } else {
      refChild.#previousSibling.#nextSibling = newChild;
    }
    newChild.#previousSibling = refChild.#previousSibling;
    refChild.#previousSibling = newChild;
    newChild.#nextSibling = refChild;
    newChild.#parent = this;
  }

  appendChild(newChild: LynxBackgroundElement): void {
    if (!this.#firstChild) {
      this.#firstChild = newChild;
      this.#lastChild = newChild;
    } else {
      if (!this.#lastChild) {
        throw new Error(
          'Invariant violation: #lastChild is null while #firstChild is not null.',
        );
      }
      this.#lastChild.#nextSibling = newChild;
      newChild.#previousSibling = this.#lastChild;
      this.#lastChild = newChild;
    }
    newChild.#parent = this;
  }

  addClass(name: string): void {
    this.#classes.add(name);
  }
  removeClass(name: string): void {
    this.#classes.delete(name);
  }
  remove(): void {
    if (!this.#parent) {
      return;
    }
    if (this.#previousSibling) {
      this.#previousSibling.#nextSibling = this.#nextSibling;
    } else {
      this.#parent.#firstChild = this.#nextSibling;
    }
    if (this.#nextSibling) {
      this.#nextSibling.#previousSibling = this.#previousSibling;
    } else {
      this.#parent.#lastChild = this.#previousSibling;
    }
    this.#nextSibling = null;
    this.#previousSibling = null;
    this.#parent = null;
  }

  parentNode(): BaseLynxElement | null {
    return this.#parent;
  }
  nextSibling(): BaseLynxElement | null {
    return this.#nextSibling;
  }
  querySelector(_selector: string): BaseLynxElement | null {
    throw new Error('Method not implemented.');
  }
  querySelectorAll(_selector: string): BaseLynxElement[] {
    throw new Error('Method not implemented.');
  }
  addEventListener(name: string, cb: (event: any) => any): () => void {
    this.#events.set(name, cb);
    return () => {
      this.#events.delete(name);
    };
  }
}

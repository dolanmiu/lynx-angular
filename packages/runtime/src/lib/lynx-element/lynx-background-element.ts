import type { BaseLynxElement } from './types';

export class LynxBackgroundElement implements BaseLynxElement {
  // When true, this element is the root page element and must not be
  // re-parented or removed from the tree.
  _isRootPageElement = false;

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
    refChild: LynxBackgroundElement | null,
  ): void {
    if (newChild._isRootPageElement) return;
    if (refChild == null) {
      this.appendChild(newChild);
      return;
    }
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
    if (newChild._isRootPageElement) return;
    if (!this.#firstChild) {
      this.#firstChild = newChild;
      this.#lastChild = newChild;
    } else {
      if (!this.#lastChild) {
        throw new Error(
          'Invariant violation: lastChild is null while firstChild is not null.',
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
    if (this._isRootPageElement) return;
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

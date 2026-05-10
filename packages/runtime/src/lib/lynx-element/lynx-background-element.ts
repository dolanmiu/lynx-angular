import type { BaseLynxElement } from './types';

export class LynxBackgroundElement implements BaseLynxElement {
  // When true, this element is the root page element and must not be
  // reparented or removed from the tree.
  _isRootPageElement = false;

  private props = new Map<string, any>();
  private styles = new Map<string, any>();
  private classes = new Set<string>();
  private events = new Map<string, (event: any) => any>();
  private _parent: LynxBackgroundElement | null = null;
  private firstChild: LynxBackgroundElement | null = null;
  private lastChild: LynxBackgroundElement | null = null;
  private _previousSibling: LynxBackgroundElement | null = null;
  private _nextSibling: LynxBackgroundElement | null = null;

  setProperty(name: string, value: any): void {
    this.props.set(name, value);
  }
  setAttribute(name: string, value: any): void {
    this.props.set(name, value);
  }
  getAttribute(name: string): string | null {
    return this.props.get(name) ?? null;
  }
  removeAttribute(name: string): void {
    this.props.delete(name);
  }
  setStyle(key: string, value: unknown): void {
    this.styles.set(key, value);
  }
  removeStyle(key: string): void {
    this.styles.delete(key);
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
    if (!refChild._previousSibling) {
      this.firstChild = newChild;
    } else {
      refChild._previousSibling._nextSibling = newChild;
    }
    newChild._previousSibling = refChild._previousSibling;
    refChild._previousSibling = newChild;
    newChild._nextSibling = refChild;
    newChild._parent = this;
  }

  appendChild(newChild: LynxBackgroundElement): void {
    if (newChild._isRootPageElement) return;
    if (!this.firstChild) {
      this.firstChild = newChild;
      this.lastChild = newChild;
    } else {
      if (!this.lastChild) {
        throw new Error(
          'Invariant violation: lastChild is null while firstChild is not null.',
        );
      }
      this.lastChild._nextSibling = newChild;
      newChild._previousSibling = this.lastChild;
      this.lastChild = newChild;
    }
    newChild._parent = this;
  }

  addClass(name: string): void {
    this.classes.add(name);
  }
  removeClass(name: string): void {
    this.classes.delete(name);
  }
  remove(): void {
    if (this._isRootPageElement) return;
    if (!this._parent) {
      return;
    }
    if (this._previousSibling) {
      this._previousSibling._nextSibling = this._nextSibling;
    } else {
      this._parent.firstChild = this._nextSibling;
    }
    if (this._nextSibling) {
      this._nextSibling._previousSibling = this._previousSibling;
    } else {
      this._parent.lastChild = this._previousSibling;
    }
    this._nextSibling = null;
    this._previousSibling = null;
    this._parent = null;
  }

  parentNode(): BaseLynxElement | null {
    return this._parent;
  }
  nextSibling(): BaseLynxElement | null {
    return this._nextSibling;
  }
  querySelector(_selector: string): BaseLynxElement | null {
    throw new Error('Method not implemented.');
  }
  querySelectorAll(_selector: string): BaseLynxElement[] {
    throw new Error('Method not implemented.');
  }
  addEventListener(name: string, cb: (event: any) => any): () => void {
    this.events.set(name, cb);
    return () => {
      this.events.delete(name);
    };
  }
}

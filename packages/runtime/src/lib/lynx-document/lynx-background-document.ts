import { LynxBackgroundElement } from '../lynx-element';
import type { LynxDocumentBase } from './types';

export class LynxBackgroundDocument implements LynxDocumentBase {
  _page: LynxBackgroundElement | null = null;

  constructor() {
    console.log('background thread lynx document');
  }
  createRootElement(): LynxBackgroundElement {
    const page = new LynxBackgroundElement();
    page.setAttribute('tagName', 'x-page');
    this._page = page;
    return this._page;
  }
  createElement(tag: string, value?: string): LynxBackgroundElement {
    // In the background thread, we create virtual elements but store their tag name
    // to help with debugging and potential future synchronization
    const element = new LynxBackgroundElement();
    element.setAttribute('tagName', tag);

    // For debugging purposes, store text content if provided
    if (value) {
      element.setAttribute('textContent', value);
    }

    console.log(`Creating background element for tag: ${tag}`);
    return element;
  }
  createText(value: string): LynxBackgroundElement {
    const element = new LynxBackgroundElement();
    element.setAttribute('tagName', 'x-text');
    element.setAttribute('textContent', value);
    return element;
  }
  createComment(): LynxBackgroundElement {
    const element = new LynxBackgroundElement();
    element.setAttribute('tagName', 'x-comment');
    return element;
  }
  appendChild(newChild: LynxBackgroundElement): void {
    this._page?.appendChild(newChild);
  }
}

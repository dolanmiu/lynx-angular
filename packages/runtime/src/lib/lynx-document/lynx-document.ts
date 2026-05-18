import { LynxElement, type LynxListElement } from '../lynx-element';
import type { ElementRef } from '../types/lynx';
import {
  createBlockElement,
  createDefaultElement,
  createForElement,
  createFrameElement,
  createIfElement,
  createImageElement,
  createInputElement,
  createListElement,
  createListItemElement,
  createOverlayElement,
  createPageElement,
  createRawTextElement,
  createScrollViewElement,
  createSvgElement,
  createTextElement,
  createViewElement,
} from './element-creators';
import type { LynxDocumentBase } from './types';

export class LynxDocument implements LynxDocumentBase {
  page!: LynxElement;
  #pageId = 0;
  #pageElementRequested = false;
  // Track NoneElements (Angular comment markers from @for/@if) so list can skip them
  readonly #nonElements = new WeakSet<ElementRef>();

  constructor() {}
  createRootElement(): LynxElement {
    const pageElement = __CreatePage('0', 0);
    this.page = new LynxElement(pageElement);
    // Prevent Angular from reparenting or removing the root page element
    // during normal component lifecycle (appendChild/remove calls).
    this.page._isRootPageElement = true;
    this.#pageId = __GetElementUniqueID(pageElement);
    return this.page;
  }
  createElement(tag: string, value?: string): LynxElement | LynxListElement {
    let element: ElementRef;
    switch (tag) {
      case 'view': {
        element = createViewElement(this.#pageId);
        break;
      }
      case 'image': {
        element = createImageElement(this.#pageId);
        break;
      }
      case 'text': {
        element = createTextElement(this.#pageId);
        break;
      }
      case 'raw-text': {
        element = createRawTextElement(value ?? '');
        break;
      }
      case 'scroll-view': {
        element = createScrollViewElement(this.#pageId);
        break;
      }
      case 'list': {
        return createListElement(this.#pageId, this.#nonElements);
      }
      case 'list-item': {
        element = createListItemElement(this.#pageId);
        break;
      }
      case 'block': {
        element = createBlockElement(this.#pageId);
        break;
      }
      case 'if': {
        element = createIfElement(this.#pageId);
        break;
      }
      case 'for': {
        element = createForElement(this.#pageId);
        break;
      }
      case 'frame': {
        element = createFrameElement(this.#pageId);
        break;
      }
      case 'input':
      case 'textarea': {
        element = createInputElement(tag, this.#pageId);
        break;
      }
      case 'overlay': {
        element = createOverlayElement(this.#pageId);
        break;
      }
      case 'svg': {
        element = createSvgElement(this.#pageId);
        break;
      }
      case 'page': {
        const result = createPageElement(this.page, this.#pageElementRequested);
        this.#pageElementRequested = result.pageElementRequested;
        return result.element;
      }
      default: {
        element = createDefaultElement(tag, this.#pageId);
      }
    }
    return new LynxElement(element);
  }
  createText(value: string): LynxElement {
    const text = __CreateRawText(value);
    const lynxElement = new LynxElement(text);
    return lynxElement;
  }
  createComment(): LynxElement {
    // Angular uses comment nodes as insertion anchors for dynamic views
    // (createComponent, @if, @for, @switch). They must be valid tree
    // participants — supporting __InsertElementBefore, __GetParent,
    // __NextElement. __CreateNonElement crashes on these operations,
    // so we use an invisible view instead.
    const element = __CreateView(this.#pageId);
    __AddInlineStyle(element, 'display', 'none');
    this.#nonElements.add(element);
    return new LynxElement(element);
  }
  appendChild(newChild: LynxElement): void {
    this.page.appendChild(newChild);
  }
}

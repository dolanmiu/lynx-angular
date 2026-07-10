import { devStats } from '../devtools/stats';
import { LynxElement, type LynxListElement } from '../lynx-element';
import type { ElementRef } from '../types/lynx';
import { setPageElementRef } from './page-ref';

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
  createRefreshElement,
  createRefreshHeaderElement,
  createScrollCoordinatorElement,
  createScrollCoordinatorHeaderElement,
  createScrollCoordinatorSlotElement,
  createScrollCoordinatorToolbarElement,
  createScrollViewElement,
  createSvgElement,
  createTextElement,
  createTitleBarViewElement,
  createViewElement,
  createViewPagerElement,
  createViewPagerItemElement,
} from './element-creators';
import type { LynxDocumentBase } from './types';

/**
 * Main-thread document that creates native Lynx elements via PAPI functions.
 * Each createElement call wraps a PAPI call (__CreateView, __CreateText, etc.)
 * and returns a LynxElement wrapping the native ElementRef. The document owns
 * the root page element and tracks its unique ID for child element creation.
 */
export class LynxDocument implements LynxDocumentBase {
  page!: LynxElement;
  #pageId = 0;
  #pageElementRequested = false;

  constructor() {}
  createRootElement(): LynxElement {
    const pageElement = __CreatePage('0', 0);
    this.page = new LynxElement(pageElement);
    this.page.tagName = 'page';
    // Prevent Angular from reparenting or removing the root page element
    // during normal component lifecycle (appendChild/remove calls).
    this.page.isRootPageElement = true;
    this.#pageId = __GetElementUniqueID(pageElement);
    setPageElementRef(pageElement);
    return this.page;
  }
  createElement(tag: string, value?: string): LynxElement | LynxListElement {
    if (__PROFILE__) devStats.elementCreated++;
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
        return createListElement(this.#pageId);
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
      case 'viewpager': {
        element = createViewPagerElement(this.#pageId);
        break;
      }
      case 'viewpager-item': {
        element = createViewPagerItemElement(this.#pageId);
        break;
      }
      case 'refresh': {
        element = createRefreshElement(this.#pageId);
        break;
      }
      case 'refresh-header': {
        element = createRefreshHeaderElement(this.#pageId);
        break;
      }
      case 'title-bar-view': {
        element = createTitleBarViewElement(this.#pageId);
        break;
      }
      case 'scroll-coordinator': {
        element = createScrollCoordinatorElement(this.#pageId);
        break;
      }
      case 'scroll-coordinator-header': {
        element = createScrollCoordinatorHeaderElement(this.#pageId);
        break;
      }
      case 'scroll-coordinator-toolbar': {
        element = createScrollCoordinatorToolbarElement(this.#pageId);
        break;
      }
      case 'scroll-coordinator-slot': {
        element = createScrollCoordinatorSlotElement(this.#pageId);
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
    const el = new LynxElement(element);
    el.tagName = tag;
    return el;
  }
  createText(value: string): LynxElement {
    const text = __CreateRawText(value);
    const lynxElement = new LynxElement(text);
    lynxElement.tagName = 'raw-text';
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
    const el = new LynxElement(element);
    // tagName 'comment' is the SOLE marker LynxListElement.getUIChildren() uses
    // to skip these @for/@if insertion anchors. It deliberately does not go in a
    // WeakSet of element refs — hashing a native ref crashes the Lepus engine
    // (see getUIChildren). Keep this tag and that filter in sync.
    el.tagName = 'comment';
    return el;
  }
  appendChild(newChild: LynxElement): void {
    this.page.appendChild(newChild);
  }
}

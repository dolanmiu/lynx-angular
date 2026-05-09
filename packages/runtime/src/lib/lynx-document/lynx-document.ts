import {
  LynxElement,
  type LynxListElement,
  setPageElement,
} from '../lynx-element';
import type { ElementRef } from '../types/lynx';
import { createListElement } from './create-list-element';
import type { LynxDocumentBase } from './types';

export class LynxDocument implements LynxDocumentBase {
  page!: LynxElement;
  #pageId = 0;
  // Track NoneElements (Angular comment markers from @for/@if) so x-list can skip them
  readonly #nonElements = new WeakSet<ElementRef>();

  constructor() {
    console.log('main thread lynx document');
  }
  createRootElement(): LynxElement {
    const pageElement = __CreatePage('0', 0);
    this.page = new LynxElement(pageElement);
    this.#pageId = __GetElementUniqueID(pageElement);
    // Publish the page element so the list microtask fallback can flush it.
    setPageElement(pageElement);
    return this.page;
  }
  createElement(tag: string, value?: string): LynxElement | LynxListElement {
    let element: ElementRef;
    switch (tag) {
      case 'x-view': {
        element = __CreateView(this.#pageId);
        break;
      }
      case 'x-image': {
        element = __CreateImage(this.#pageId);

        // Set default image properties
        __SetConfig(element, {
          mode: 'aspectFit', // Default to maintaining aspect ratio
          fadeIn: true, // Enable image fade-in effect
          loadingPlaceholder: '', // No default placeholder
        });

        break;
      }
      case 'x-text': {
        element = __CreateText(this.#pageId);
        break;
      }
      case 'x-raw-text': {
        element = __CreateRawText(value ?? '');
        break;
      }
      case 'x-scroll-view': {
        // No __SetConfig needed — bounces defaults to true per the API.
        // All scroll-view properties (scroll-orientation, enable-scroll, etc.)
        // are attributes, set via __SetAttribute by Angular template bindings.
        element = __CreateScrollView(this.#pageId);
        break;
      }
      case 'x-list': {
        return createListElement(this.#pageId, this.#nonElements);
      }
      case 'list-item': {
        // x-list requires native list-item elements via __CreateElement, not plain views.
        // The native componentAtIndex callback returns this element ID to the engine,
        // which expects a list-item type — using __CreateView crashes the native side.
        element = __CreateElement('list-item', this.#pageId);
        break;
      }
      case 'x-block': {
        element = __CreateBlock(this.#pageId);
        break;
      }
      case 'x-if': {
        element = __CreateIf(this.#pageId);
        break;
      }
      case 'x-for': {
        element = __CreateFor(this.#pageId);
        break;
      }
      default: {
        console.warn(
          `Unknown element tag "${tag}". Falling back to view element.`,
        );
        element = __CreateView(this.#pageId);
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
    // so we use an invisible x-view instead.
    const element = __CreateView(this.#pageId);
    __AddInlineStyle(element, 'display', 'none');
    this.#nonElements.add(element);
    return new LynxElement(element);
  }
  appendChild(newChild: LynxElement): void {
    this.page.appendChild(newChild);
  }
}

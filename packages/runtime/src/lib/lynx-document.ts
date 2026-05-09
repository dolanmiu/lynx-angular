import {
  type BaseLynxElement,
  LynxBackgroundElement,
  LynxElement,
  LynxListElement,
} from './lynx-element';
import type { ElementRef, ListElementRef } from './types/lynx';

export class LynxDocument {
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
    return this.page;
  }
  createElement(tag: string, value?: string): LynxElement {
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
        // Lynx's native x-list is a virtualized list driven by engine callbacks.
        // Angular's rendering calls LynxListElement.appendChild() for each child;
        // we intercept this and store children in a virtual JS-level linked list.
        //
        // _scheduleUpdate pre-appends all children to the native list tree, sets
        // update-list-info, then calls __FlushElementTree() to trigger rendering.
        // The engine calls componentAtIndex for each visible index; we just return
        // the element ID since children are already appended.
        //
        // NOTE: React Lynx appends + flushes per-item inside componentAtIndex,
        // but that causes re-entrant __FlushElementTree crashes when triggered
        // from setTimeout (Angular's async scheduling). Pre-appending avoids this
        // because Angular already fully builds all children before the list update.

        // Forward-declared so componentAtIndex closure can reference it
        let listEl: LynxListElement;

        const componentAtIndex = (
          _listRef: ListElementRef,
          listId: number,
          cellIndex: number,
          opId: number,
        ) => {
          // Append child to native list tree on demand and flush it —
          // matching React Lynx pattern. The native list expects children
          // to be attached inside this callback, not pre-appended.
          const uiChildren = listEl.getUIChildren();
          if (cellIndex < uiChildren.length) {
            const child = uiChildren[cellIndex];
            listEl.appendChildToNativeList(child);
            const elementID = __GetElementUniqueID(child);
            // Per-item flush with list-specific options — tells the native
            // engine this is a list item, not a page-level flush.
            __FlushElementTree(child, {
              triggerLayout: true,
              operationID: opId,
              elementID,
              listID: listId,
            });
            return elementID;
          }
          return undefined;
        };

        const enqueueComponent = (
          _listRef: ListElementRef,
          _listId: number,
          _eleId: number,
        ) => {
          // enqueueComponent signals that the native list is done with an item
          // (i.e., it scrolled off-screen and can be recycled). We don't implement
          // a recycle pool — items stay in the native list tree permanently.
        };

        const nativeList = __CreateList(
          this.#pageId,
          componentAtIndex,
          enqueueComponent,
        );

        // list-type, span-count, and scroll-orientation are all required by the
        // native list engine (per Lynx docs). Without them the native side crashes
        // at render time. Defaults to a single-column vertical list; users can
        // override via template attributes.
        __SetAttribute(nativeList, 'list-type', 'single');
        __SetAttribute(nativeList, 'span-count', 1);
        __SetAttribute(nativeList, 'scroll-orientation', 'vertical');

        listEl = new LynxListElement(nativeList, this.#nonElements);
        return listEl;
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

export type LynxDocumentBase = {
  createRootElement(): BaseLynxElement;
  createElement(tag: string, value?: string): BaseLynxElement;
  createText(value: string): BaseLynxElement;
  createComment(): BaseLynxElement;
  appendChild(newChild: BaseLynxElement): void;
};

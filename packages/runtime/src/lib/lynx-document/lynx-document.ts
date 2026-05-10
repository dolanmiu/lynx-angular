import { LynxElement, type LynxListElement } from '../lynx-element';
import type { ElementRef } from '../types/lynx';
import { createListElement } from './create-list-element';
import type { LynxDocumentBase } from './types';

export class LynxDocument implements LynxDocumentBase {
  page!: LynxElement;
  #pageId = 0;
  #pageElementRequested = false;
  // Track NoneElements (Angular comment markers from @for/@if) so list can skip them
  readonly #nonElements = new WeakSet<ElementRef>();

  constructor() {
    console.log('main thread lynx document');
  }
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
        element = __CreateView(this.#pageId);
        break;
      }
      case 'image': {
        element = __CreateImage(this.#pageId);

        // Set default image properties
        __SetConfig(element, {
          mode: 'aspectFit', // Default to maintaining aspect ratio
          fadeIn: true, // Enable image fade-in effect
          loadingPlaceholder: '', // No default placeholder
        });

        break;
      }
      case 'text': {
        element = __CreateText(this.#pageId);
        break;
      }
      case 'raw-text': {
        element = __CreateRawText(value ?? '');
        break;
      }
      case 'scroll-view': {
        // No __SetConfig needed — bounces defaults to true per the API.
        // All scroll-view properties (scroll-orientation, enable-scroll, etc.)
        // are attributes, set via __SetAttribute by Angular template bindings.
        element = __CreateScrollView(this.#pageId);
        break;
      }
      case 'list': {
        return createListElement(this.#pageId, this.#nonElements);
      }
      case 'list-item': {
        // list requires native list-item elements via __CreateElement, not plain views.
        // The native componentAtIndex callback returns this element ID to the engine,
        // which expects a list-item type — using __CreateView crashes the native side.
        element = __CreateElement('list-item', this.#pageId);
        break;
      }
      case 'block': {
        element = __CreateBlock(this.#pageId);
        break;
      }
      case 'if': {
        element = __CreateIf(this.#pageId);
        break;
      }
      case 'for': {
        element = __CreateFor(this.#pageId);
        break;
      }
      case 'frame': {
        // Native frame element — embeds a nested Lynx page (similar to HTML iframe).
        // Attributes (src, data, global-props) and events (bindload) are set via
        // standard __SetAttribute/__AddEvent by Angular template bindings.
        element = __CreateFrame(this.#pageId);
        break;
      }
      case 'input':
      case 'textarea': {
        // XElements — use generic __CreateElement (no dedicated creation functions).
        // Require native-side input plugin to be registered by the app host.
        element = __CreateElement(tag, this.#pageId);
        // Native Lynx inputs have no intrinsic height or border (unlike HTML inputs),
        // so provide sensible defaults so the element is always visible.
        __AddInlineStyle(
          element,
          'height',
          tag === 'textarea' ? '80px' : '40px',
        );
        __AddInlineStyle(element, 'border', '1px solid');
        break;
      }
      case 'overlay': {
        // Native overlay — renders outside the Lynx document flow on a separate
        // rendering layer. Used for modals, bottom sheets, and dialogs that need
        // to cover the entire embedded page. Controlled via the `visible` attribute.
        element = __CreateElement('overlay', this.#pageId);
        break;
      }
      case 'svg': {
        // SVG is a native Lynx element — the engine parses the SVG content
        // (set via the `content` attribute) on a background thread and renders
        // it as a single native view. No individual SVG child nodes are created.
        element = __CreateElement('svg', this.#pageId);
        break;
      }
      case 'page': {
        // Returns the existing root page element — does NOT create a new one.
        // Only one <page> element is allowed per application. The page element's
        // _isRootPageElement guard prevents Angular from reparenting or removing it.
        if (this.#pageElementRequested) {
          console.warn(
            'Multiple <page> elements detected. Only one <page> is allowed per application.',
          );
        }
        this.#pageElementRequested = true;
        return this.page;
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

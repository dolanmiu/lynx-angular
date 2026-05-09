import {
  Injectable,
  inject,
  type Renderer2,
  type RendererFactory2,
  type RendererType2,
  ViewEncapsulation,
} from '@angular/core';
import { EmulatedLynxRenderer } from './emulated-lynx-renderer';
import type { LynxDocument, LynxDocumentBase } from './lynx-document';
import { processPendingListUpdates } from './lynx-element';
import { LynxRenderer } from './renderer';
import { LYNX_DOCUMENT } from './token';

@Injectable()
export class LynxRendererFactory2 implements RendererFactory2 {
  lynxDocument: LynxDocumentBase = inject(LYNX_DOCUMENT);
  #defaultRenderer: LynxRenderer | null = null;
  #emulatedRenderers = new Map<string, EmulatedLynxRenderer>();

  createRenderer(_hostElement: any, type: RendererType2 | null): Renderer2 {
    if (!type || type.encapsulation === ViewEncapsulation.None) {
      if (!this.#defaultRenderer) {
        this.#defaultRenderer = new LynxRenderer(this.lynxDocument);
      }
      return this.#defaultRenderer;
    }

    if (type.encapsulation === ViewEncapsulation.ShadowDom) {
      console.warn(
        'ViewEncapsulation.ShadowDom is not supported in Lynx. Falling back to no encapsulation.',
      );
      if (!this.#defaultRenderer) {
        this.#defaultRenderer = new LynxRenderer(this.lynxDocument);
      }
      return this.#defaultRenderer;
    }

    // ViewEncapsulation.Emulated (default)
    let renderer = this.#emulatedRenderers.get(type.id);
    if (!renderer) {
      renderer = new EmulatedLynxRenderer(this.lynxDocument, type.id);
      this.#emulatedRenderers.set(type.id, renderer);
    }
    return renderer;
  }
  begin?(): void {}
  end?(): void {
    if (__MAIN_THREAD__) {
      // Process pending x-list updates before flushing — list elements
      // need update-list-info set before the native engine processes the
      // element tree. This replaces the old setTimeout-based approach
      // which crashed because __FlushElementTree can't be called from
      // macrotask contexts.
      processPendingListUpdates();
      // Bare __FlushElementTree() (no args) is what the native engine uses to
      // process update-list-info and trigger componentAtIndex. Passing page.element
      // with options uses a different code path that skips list processing.
      __FlushElementTree();
    }
  }
}

import {
  Injectable,
  inject,
  type Renderer2,
  type RendererFactory2,
  type RendererType2,
  ViewEncapsulation,
} from '@angular/core';
import type { LynxDocumentBase } from '../lynx-document';
import { processPendingListUpdates } from '../lynx-element';
import { EmulatedLynxRenderer } from './emulated-lynx-renderer';
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
      // Bare flush first: commits all element creation/attribute changes.
      // Lists have no update-list-info yet, so the engine skips list processing.
      __FlushElementTree();

      // Now process pending lists: sets update-list-info + targeted flush
      // per list element. Targeted flush avoids the intermittent native crash
      // that bare __FlushElementTree() causes when processing lists.
      processPendingListUpdates();
    }
  }
}

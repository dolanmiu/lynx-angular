import {
  Injectable,
  inject,
  type Renderer2,
  type RendererFactory2,
  type RendererType2,
  ViewEncapsulation,
} from '@angular/core';
import { devStats } from '../devtools/stats';
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

  // Angular calls createRenderer once per component type. The renderer is
  // cached by encapsulation mode + component ID, so each component type gets
  // at most one renderer instance that's reused across all instances of that
  // component.
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

    // ViewEncapsulation.Emulated (default) — one EmulatedLynxRenderer per
    // component type, keyed by type.id (the ɵcmp.id we set in angular.ts).
    let renderer = this.#emulatedRenderers.get(type.id);
    if (!renderer) {
      renderer = new EmulatedLynxRenderer(this.lynxDocument, type.id);
      this.#emulatedRenderers.set(type.id, renderer);
    }
    return renderer;
  }
  begin?(): void {}
  // Called by Angular after every change detection cycle completes.
  // On the background thread this is a no-op — there's no native tree to flush.
  // On the main thread, the flush order is critical:
  //   1. __FlushElementTree() — commits all pending element mutations to native
  //   2. processPendingListUpdates() — sends update-list-info for lists that
  //      gained/lost children during this CD cycle, then does a targeted flush
  //      per list. This MUST run after the bare flush so list children's subtrees
  //      are already committed when componentAtIndex appends them.
  // Reversing this order causes list items to appear empty (subtree not committed)
  // or crashes from re-entrant __FlushElementTree.
  end?(): void {
    if (__MAIN_THREAD__) {
      // During SSR hydration the native tree already exists from the snapshot
      // — flushing would be redundant and could cause visual glitches.
      if (__ENABLE_SSR__ && (globalThis as any).__LYNX_IS_HYDRATING__) {
        return;
      }

      if (__PROFILE__) {
        devStats.cdCycles++;
        devStats.flushCount++;
      }

      __FlushElementTree();
      processPendingListUpdates();
    }
  }
}

import {
  Injectable,
  type Renderer2,
  type RendererFactory2,
  type RendererType2,
  inject,
} from '@angular/core';
import type { LynxDocumentBase } from './lynx-document';
import { LynxRenderer } from './renderer';
import { LYNX_DOCUMENT } from './token';

@Injectable()
export class LynxRendererFactory2 implements RendererFactory2 {
  lynxDocument: LynxDocumentBase = inject(LYNX_DOCUMENT);
  createRenderer(_hostElement: any, _type: RendererType2 | null): Renderer2 {
    return new LynxRenderer(this.lynxDocument);
  }
  begin?(): void {}
  end?(): void {
    if (__MAIN_THREAD__) {
      __FlushElementTree();
    }
  }
}

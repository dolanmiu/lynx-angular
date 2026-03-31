import type { LynxDocumentBase } from './lynx-document';
import { LynxRenderer } from './renderer';

export class EmulatedLynxRenderer extends LynxRenderer {
  private contentAttr: string;
  private hostAttr: string;

  constructor(document: LynxDocumentBase, componentId: string) {
    super(document);
    this.contentAttr = `_ngcontent-${componentId}`;
    this.hostAttr = `_nghost-${componentId}`;
  }

  override createElement(name: string, namespace?: string | null) {
    const el = super.createElement(name, namespace);
    el.setAttribute(this.contentAttr, '');
    return el;
  }

  override selectRootElement() {
    const el = super.selectRootElement();
    el.setAttribute(this.hostAttr, '');
    return el;
  }
}

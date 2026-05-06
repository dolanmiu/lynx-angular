import type { LynxDocumentBase } from './lynx-document';
import { LynxRenderer } from './renderer';

export class EmulatedLynxRenderer extends LynxRenderer {
  #componentScopeId: string;

  constructor(document: LynxDocumentBase, componentId: string) {
    super(document);
    this.#componentScopeId = componentId;
  }

  // Note: we no longer add scope classes to child elements. The Lynx template
  // embeds the component scope ID separately from element class lists, so plain
  // class selectors in CSS are matched by the native CSS engine without needing
  // a conjunction scope class on every element.

  override selectRootElement() {
    const el = super.selectRootElement();
    // Keep scope class on the host element for potential :host CSS rules.
    el.addClass(`_nghost-${this.#componentScopeId}`);
    return el;
  }
}

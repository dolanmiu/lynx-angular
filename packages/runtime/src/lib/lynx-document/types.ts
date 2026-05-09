import type { BaseLynxElement } from '../lynx-element';

export type LynxDocumentBase = {
  createRootElement(): BaseLynxElement;
  createElement(tag: string, value?: string): BaseLynxElement;
  createText(value: string): BaseLynxElement;
  createComment(): BaseLynxElement;
  appendChild(newChild: BaseLynxElement): void;
};

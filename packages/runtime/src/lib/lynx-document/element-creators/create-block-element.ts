import type { ElementRef } from '../../types/lynx';

// Use __CreateElement('block') instead of __CreateBlock() — see create-if-element.ts
// for the full rationale. Same cross-platform compatibility requirement applies here.
export const createBlockElement = (pageId: number): ElementRef => {
  return __CreateElement('block', pageId);
};

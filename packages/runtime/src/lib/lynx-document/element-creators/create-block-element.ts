import type { ElementRef } from '../../types/lynx';

export const createBlockElement = (pageId: number): ElementRef => {
  return __CreateBlock(pageId);
};

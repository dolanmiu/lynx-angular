import type { ElementRef } from '../../types/lynx';

export const createForElement = (pageId: number): ElementRef => {
  return __CreateFor(pageId);
};

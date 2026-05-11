import type { ElementRef } from '../../types/lynx';

export const createIfElement = (pageId: number): ElementRef => {
  return __CreateIf(pageId);
};

import type { ElementRef } from '../types/lynx';

/**
 * Exposed for SSR encode — ssrEncode() needs the raw page ElementRef to walk
 * the native tree. Only set on the main thread after createRootElement().
 *
 * Lives in its own file to avoid a circular import between lynx-element.ts
 * (which reads this) and lynx-document.ts (which writes this and imports
 * LynxElement). Direct mutation via setPageElementRef() keeps the ESM live
 * binding intact for all importers.
 */
export let __pageElementRef: ElementRef | null = null;

export const setPageElementRef = (ref: ElementRef | null): void => {
  __pageElementRef = ref;
};

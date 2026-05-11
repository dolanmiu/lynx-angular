import type { ElementRef } from '../../types/lynx';

export const createImageElement = (pageId: number): ElementRef => {
  const element = __CreateImage(pageId);

  // Set default image properties
  __SetConfig(element, {
    mode: 'aspectFit', // Default to maintaining aspect ratio
    fadeIn: true, // Enable image fade-in effect
    loadingPlaceholder: '', // No default placeholder
  });

  return element;
};

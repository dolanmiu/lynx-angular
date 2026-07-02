const svg = (paths: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

// All icons must be built from <path>/<circle>/etc. — never <line>.
//
// Lynx renders the <svg content="..."> string on the native thread via the
// ServalSVG engine. Its <line> handler (SrSVGLine::onDraw) guards drawing on a
// stroke set DIRECTLY on the <line>, whereas <path>/<circle>/<rect> draw
// unconditionally and let the canvas layer resolve stroke/fill. We set
// stroke="currentColor" once on the root <svg> and let children inherit it, so
// a <line>'s own stroke is null and the guard skips it entirely — the line
// silently never paints on device (web renders it fine, so it looks correct in
// a browser preview but disappears on iOS/Android). <path> equivalents avoid
// the bug: e.g. a horizontal <line x1=4 x2=20 y=12> becomes <path d="M4 12h16"/>.
export const ICONS = {
  check: svg('<path d="M20 6 9 17l-5-5"/>'),
  x: svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
  plus: svg('<path d="M5 12h14"/><path d="M12 5v14"/>'),
  minus: svg('<path d="M5 12h14"/>'),
  'chevron-down': svg('<path d="m6 9 6 6 6-6"/>'),
  'chevron-up': svg('<path d="m18 15-6-6-6 6"/>'),
  'chevron-left': svg('<path d="m15 18-6-6 6-6"/>'),
  'chevron-right': svg('<path d="m9 18 6-6-6-6"/>'),
  'arrow-left': svg('<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>'),
  'arrow-right': svg('<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>'),
  search: svg('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
  menu: svg('<path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h16"/>'),
  info: svg(
    '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  ),
  'alert-triangle': svg(
    '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  ),
  loader: svg(
    '<path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/>',
  ),
  circle: svg('<circle cx="12" cy="12" r="10"/>'),
  ellipsis: svg(
    '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  ),
  eye: svg(
    '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  ),
  'eye-off': svg(
    '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>',
  ),
  settings: svg(
    '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  ),
  trash: svg(
    '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/>',
  ),
  heart: svg(
    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  ),
  star: svg(
    '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a.53.53 0 0 0 .4.29l5.16.756a.53.53 0 0 1 .294.904l-3.733 3.638a.53.53 0 0 0-.152.469l.882 5.14a.53.53 0 0 1-.77.56l-4.614-2.426a.53.53 0 0 0-.494 0L6.18 18.73a.53.53 0 0 1-.77-.56l.881-5.139a.53.53 0 0 0-.152-.47L2.406 8.925a.53.53 0 0 1 .294-.906l5.16-.755a.53.53 0 0 0 .4-.29z"/>',
  ),
  bell: svg(
    '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
  ),
} as const;

export type IconName = keyof typeof ICONS;

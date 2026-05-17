/*
 * Public API Surface of @blotch/angular-lynx
 */

export { LynxAnimation } from './lib/animation/animation';
export type { LynxAnimationOptions } from './lib/animation/animation';
export {
  LYNX_ELEMENTS,
  LynxBlock,
  LynxFor,
  LynxFrame,
  LynxIf,
  LynxImage,
  LynxInput,
  LynxList,
  LynxListItem,
  LynxOverlay,
  LynxScrollView,
  LynxSvg,
  LynxText,
  LynxTextarea,
  LynxView,
} from './lib/lynx-elements';
export { LynxLoggerService } from './lib/lynx-logger';
export { provideRenderer } from './lib/renderer/providers';
export { LynxLocationStrategy } from './lib/router/lynx-location-strategy';
export { LynxPlatformLocation } from './lib/router/lynx-platform-location';
export { LynxRouteReuseStrategy } from './lib/router/lynx-route-reuse-strategy';
export { provideRouter } from './lib/router/lynx-router';
export { bootstrapApplication } from './lib/runtime';
import './lib/types/runtime-types';
import './lib/types/lynx';

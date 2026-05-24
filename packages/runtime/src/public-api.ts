/*
 * Public API Surface of @blotch/angular-lynx
 */

export { LynxAnimation } from './lib/animation/animation';
export type { LynxAnimationOptions } from './lib/animation/animation';
export { registerDataProcessors } from './lib/data-flow/data-processors';
export type {
  DataProcessorDefinition,
  GlobalProps,
  InitData,
  InitDataRaw,
} from './lib/data-flow/data-flow.types';
export { LynxGlobalPropsService } from './lib/data-flow/global-props.service';
export { LynxInitDataService } from './lib/data-flow/init-data.service';
export { LynxErrorHandler } from './lib/error-handler/lynx-error-handler';
export { LynxFontService } from './lib/font';
export type {
  LynxFontEntry,
  LynxFontFaceConfig,
  LynxFontStatus,
} from './lib/font';
export {
  BaseGesture,
  ComposedGesture,
  ContinuousGesture,
  FlingGesture,
  Gesture,
  GestureStateManager,
  LongPressGesture,
  LynxGestureDetector,
  PanGesture,
  PinchGesture,
  RotationGesture,
  TapGesture,
  FlingDirection,
  GestureState,
  GestureType,
} from './lib/gesture';
export type {
  FlingGestureEvent,
  GestureCallback,
  GestureCallbackWithState,
  GestureEvent,
  LongPressGestureEvent,
  PanGestureEvent,
  PinchGestureEvent,
  RotationGestureEvent,
  TapGestureEvent,
} from './lib/gesture';
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
export { LynxTextMeasureService } from './lib/text-measure';
export { provideRenderer } from './lib/renderer/providers';
export { LynxLocationStrategy } from './lib/router/lynx-location-strategy';
export { LynxPlatformLocation } from './lib/router/lynx-platform-location';
export { LynxRouteReuseStrategy } from './lib/router/lynx-route-reuse-strategy';
export { provideRouter } from './lib/router/lynx-router';
export { bootstrapApplication } from './lib/runtime';
import './lib/types/runtime-types';
import './lib/types/lynx';

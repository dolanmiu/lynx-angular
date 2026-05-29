/*
 * Public API Surface of @blotch/angular-lynx
 */

export { LynxAnimation } from './lib/animation/animation';
export type { LynxAnimationOptions } from './lib/animation/animation';
export { registerDataProcessors } from './lib/data-flow/data-processors';
export type {
  DataProcessorDefinition,
  GlobalData,
  InitData,
  InitDataRaw,
} from './lib/data-flow/data-flow.types';
export { LynxGlobalDataService } from './lib/data-flow/global-data.service';
export { LynxInitDataService } from './lib/data-flow/init-data.service';
export { LynxErrorHandler } from './lib/error-handler/lynx-error-handler';
export { LynxExposureDirective, LynxExposureService } from './lib/exposure';
export type {
  ExposureEventDetail,
  GlobalExposureEvent,
  ObserverFrameRateOptions,
} from './lib/exposure';
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
  LynxViewPager,
  LynxViewPagerItem,
} from './lib/lynx-elements';
export { LynxLoggerService } from './lib/lynx-logger';
export { LynxNativeModuleService } from './lib/native-module';
export type { NativeModuleMap } from './lib/native-module';
export {
  mainThreadFn,
  backgroundFn,
  MainThreadRef,
  createMainThreadRef,
  MainThreadElement,
  LynxMainThreadEvent,
  LynxMainThreadService,
} from './lib/main-thread';
export type { MainThreadFnHandle, BackgroundFnHandle } from './lib/main-thread';
export type { MainThread } from './lib/main-thread';
export { LynxResourcePrefetchService } from './lib/resource-prefetch';
export type {
  PrefetchCacheTarget,
  PrefetchPriority,
  PrefetchRequest,
  PrefetchResultDetail,
} from './lib/resource-prefetch';
export { LynxSessionStorageService } from './lib/session-storage';
export type { SessionStorageSubscription } from './lib/session-storage';
export { LynxSystemInfoService } from './lib/system-info';
export { LynxTextMeasureService } from './lib/text-measure';
export { LynxTransition } from './lib/transition';
export { provideRenderer } from './lib/renderer/providers';
export { LynxLocationStrategy } from './lib/router/lynx-location-strategy';
export { LynxPlatformLocation } from './lib/router/lynx-platform-location';
export { LynxRouteReuseStrategy } from './lib/router/lynx-route-reuse-strategy';
export { provideRouter } from './lib/router/lynx-router';
export { bootstrapApplication } from './lib/runtime';
import './lib/types/runtime-types';
import './lib/types/lynx';

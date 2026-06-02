import { APP_BASE_HREF } from '@angular/common';
import {
  DOCUMENT,
  ErrorHandler,
  type EnvironmentProviders,
  makeEnvironmentProviders,
  RendererFactory2,
} from '@angular/core';
import { LynxErrorHandler } from '../error-handler/lynx-error-handler';
import { LynxBackgroundDocument, LynxDocument } from '../lynx-document';
import { LynxHydrateDocument } from '../ssr/hydrate-document';
import { LynxRendererFactory2 } from './lynx-renderer-factory2';
import { LYNX_DOCUMENT } from './token';

export const provideRenderer = (): EnvironmentProviders => {
  return makeEnvironmentProviders([
    {
      provide: LYNX_DOCUMENT,
      useFactory: () => {
        if (__MAIN_THREAD__) {
          // SSR hydration: the Lynx engine already reconstructed native
          // elements from a snapshot. Return a document that reuses those
          // elements instead of creating new ones.
          if (__ENABLE_SSR__ && (globalThis as any).__LYNX_IS_HYDRATING__) {
            return new LynxHydrateDocument(
              (globalThis as any).__LYNX_HYDRATE_PAGE__,
              (globalThis as any).__LYNX_HYDRATE_QUEUE__,
            );
          }
          return new LynxDocument();
        }
        return new LynxBackgroundDocument();
      },
    },
    {
      provide: DOCUMENT,
      useValue: {},
    },
    // Provide a base href so Angular's PathLocationStrategy uses it directly
    // instead of calling getBaseHrefFromDOM(), which crashes in Lynx because
    // BrowserPlatformLocation (platform-level) tries to querySelector on an
    // undefined DOCUMENT.
    {
      provide: APP_BASE_HREF,
      useValue: '/',
    },
    LynxRendererFactory2,
    {
      provide: RendererFactory2,
      useExisting: LynxRendererFactory2,
    },
    {
      provide: ErrorHandler,
      useClass: LynxErrorHandler,
    },
  ]);
};

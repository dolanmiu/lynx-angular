import type { ApplicationConfig, ApplicationRef, Type } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { firstValueFrom, Subject } from 'rxjs';

// @ts-expect-error
globalThis.renderPage = () => {
  pageReady.next();
};

// @ts-expect-error
globalThis.updatePage = () => {};
// @ts-expect-error
globalThis.processData = () => {};
// @ts-expect-error
globalThis.runWorklet = (value, params) => {
  if (typeof value === 'function') {
    value(...params);
  }
};

const pageReady = new Subject<void>();

// const renderLynx = (cb: ()=> void): void => {
//   if(__MAIN_THREAD__){
//     pageReady.pipe(first()).subscribe(()=> {
//       cb();
//     });
//   } else {
//     cb();
//   }
// }

export const bootstrapLynxApplication = async (
  rootComponent: Type<unknown>,
  options?: ApplicationConfig,
): Promise<ApplicationRef> => {
  // should we provide lynxRenderer here or let the consumer do it?
  if (__MAIN_THREAD__) {
    await firstValueFrom(pageReady);
    return bootstrapApplication(rootComponent, options);
  }
  return bootstrapApplication(rootComponent, options);
};

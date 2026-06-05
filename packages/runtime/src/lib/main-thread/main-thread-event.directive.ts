import {
  Directive,
  ElementRef,
  inject,
  type OnChanges,
  type OnDestroy,
  type SimpleChanges,
} from '@angular/core';
import type { BaseLynxElement } from '../lynx-element/types';
import type { MainThreadFnHandle } from './main-thread-fn';

// Plain functions are also accepted because the worklet build plugin transforms
// them into MainThreadFnHandle objects at compile time.
type MaybeHandle =
  | MainThreadFnHandle
  | ((...args: any[]) => any)
  | undefined
  | null;

// Maps directive input names to [eventType, eventName] for __AddEvent.
const INPUT_TO_EVENT: Record<string, [string, string]> = {
  mainThreadBindtap: ['bindEvent', 'tap'],
  mainThreadCatchtap: ['catchEvent', 'tap'],
  mainThreadBindtouchstart: ['bindEvent', 'touchstart'],
  mainThreadCatchtouchstart: ['catchEvent', 'touchstart'],
  mainThreadBindtouchmove: ['bindEvent', 'touchmove'],
  mainThreadCatchtouchmove: ['catchEvent', 'touchmove'],
  mainThreadBindtouchend: ['bindEvent', 'touchend'],
  mainThreadCatchtouchend: ['catchEvent', 'touchend'],
  mainThreadBindlongpress: ['bindEvent', 'longpress'],
  mainThreadCatchlongpress: ['catchEvent', 'longpress'],
  mainThreadBindscroll: ['bindEvent', 'scroll'],
  mainThreadCatchscroll: ['catchEvent', 'scroll'],
  mainThreadBindanimationstart: ['bindEvent', 'animationstart'],
  mainThreadBindanimationend: ['bindEvent', 'animationend'],
  mainThreadBindtransitionend: ['bindEvent', 'transitionend'],
  mainThreadBindlayoutchange: ['bindEvent', 'layoutchange'],
};

const isMainThreadHandle = (h: MaybeHandle): h is MainThreadFnHandle =>
  !!h &&
  '__isMainThreadFn' in h &&
  !!(h as MainThreadFnHandle).__isMainThreadFn;

@Directive({
  selector:
    '[mainThreadBindtap],[mainThreadCatchtap],' +
    '[mainThreadBindtouchstart],[mainThreadCatchtouchstart],' +
    '[mainThreadBindtouchmove],[mainThreadCatchtouchmove],' +
    '[mainThreadBindtouchend],[mainThreadCatchtouchend],' +
    '[mainThreadBindlongpress],[mainThreadCatchlongpress],' +
    '[mainThreadBindscroll],[mainThreadCatchscroll],' +
    '[mainThreadBindanimationstart],[mainThreadBindanimationend],' +
    '[mainThreadBindtransitionend],[mainThreadBindlayoutchange]',
  standalone: true,
  inputs: [
    'mainThreadBindtap',
    'mainThreadCatchtap',
    'mainThreadBindtouchstart',
    'mainThreadCatchtouchstart',
    'mainThreadBindtouchmove',
    'mainThreadCatchtouchmove',
    'mainThreadBindtouchend',
    'mainThreadCatchtouchend',
    'mainThreadBindlongpress',
    'mainThreadCatchlongpress',
    'mainThreadBindscroll',
    'mainThreadCatchscroll',
    'mainThreadBindanimationstart',
    'mainThreadBindanimationend',
    'mainThreadBindtransitionend',
    'mainThreadBindlayoutchange',
  ],
})
export class LynxMainThreadEvent implements OnChanges, OnDestroy {
  readonly #el: BaseLynxElement = inject(ElementRef).nativeElement;
  #registeredEvents: [string, string][] = [];

  mainThreadBindtap?: MaybeHandle;
  mainThreadCatchtap?: MaybeHandle;
  mainThreadBindtouchstart?: MaybeHandle;
  mainThreadCatchtouchstart?: MaybeHandle;
  mainThreadBindtouchmove?: MaybeHandle;
  mainThreadCatchtouchmove?: MaybeHandle;
  mainThreadBindtouchend?: MaybeHandle;
  mainThreadCatchtouchend?: MaybeHandle;
  mainThreadBindlongpress?: MaybeHandle;
  mainThreadCatchlongpress?: MaybeHandle;
  mainThreadBindscroll?: MaybeHandle;
  mainThreadCatchscroll?: MaybeHandle;
  mainThreadBindanimationstart?: MaybeHandle;
  mainThreadBindanimationend?: MaybeHandle;
  mainThreadBindtransitionend?: MaybeHandle;
  mainThreadBindlayoutchange?: MaybeHandle;

  ngOnChanges(changes: SimpleChanges): void {
    const elementRef = (this.#el as any).element;
    if (!elementRef) return;

    for (const inputName of Object.keys(changes)) {
      const mapping = INPUT_TO_EVENT[inputName];
      if (!mapping) continue;

      const [eventType, eventName] = mapping;
      const handle = (this as any)[inputName] as MaybeHandle;

      if (isMainThreadHandle(handle)) {
        __AddEvent(elementRef, eventType, eventName, {
          type: 'worklet',
          value: { _wkltId: handle._wkltId, _workletType: 'main-thread' },
        });
        this.#registeredEvents.push([eventType, eventName]);
      }
    }
  }

  ngOnDestroy(): void {
    const elementRef = (this.#el as any).element;
    if (!elementRef) return;

    for (const [eventType, eventName] of this.#registeredEvents) {
      __AddEvent(elementRef, eventType, eventName, undefined);
    }
    this.#registeredEvents = [];
  }
}

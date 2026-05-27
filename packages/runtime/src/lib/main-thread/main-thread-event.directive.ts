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

type MaybeHandle = MainThreadFnHandle | undefined | null;

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

      if (handle && handle.__isMainThreadFn) {
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

    try {
      const events = __GetEvents(elementRef);
      const registered = new Set(
        this.#registeredEvents.map(([t, n]) => `${t}:${n}`),
      );
      const filtered = Object.entries(events).reduce<
        Record<string, Record<string, any>>
      >((acc, [key, value]) => {
        if (!registered.has(key)) {
          acc[key] = value;
        }
        return acc;
      }, {});
      __SetEvents(elementRef, Object.values(filtered));
    } catch {
      // Element may already be destroyed
    }
    this.#registeredEvents = [];
  }
}

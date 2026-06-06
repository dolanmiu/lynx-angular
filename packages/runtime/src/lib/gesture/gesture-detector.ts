import {
  Directive,
  ElementRef,
  inject,
  type OnChanges,
  type OnDestroy,
  type SimpleChanges,
} from '@angular/core';
import type { BaseLynxElement } from '../lynx-element/types';
import type { BaseGesture } from './base-gesture';
import { ComposedGesture } from './composition';
import { GestureStateManager } from './state-manager';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyGesture = BaseGesture<any, any>;
type GestureInput = AnyGesture | AnyGesture[] | ComposedGesture;

@Directive({
  selector: '[lynxGesture]',
  inputs: ['lynxGesture'],
})
export class LynxGestureDetector implements OnChanges, OnDestroy {
  readonly #el: BaseLynxElement = inject(ElementRef).nativeElement;
  #attachedIds: number[] = [];

  lynxGesture!: GestureInput;

  ngOnChanges(_changes: SimpleChanges): void {
    this.#detachAll();
    const gestures = this.#resolveGestures();

    for (const g of gestures) {
      const elementRef = (this.#el as any).element;
      if (!elementRef) continue;

      const stateManager = new GestureStateManager(elementRef, g.id);
      const config = {
        callbacks: Object.entries(g._callbacks).map(([name, cb]) => ({
          name,
          callback: (event: any) => (cb as any)(event, stateManager),
        })),
        config: Object.keys(g._config).length > 0 ? g._config : undefined,
      };
      const relationMap: Record<string, number[]> = {
        waitFor: g._waitFor.map((dep) => dep.id),
        simultaneous: g._simultaneousWith.map((dep) => dep.id),
        continueWith: g._continueWith.map((dep) => dep.id),
      };

      __SetGestureDetector(elementRef, g.id, g.type, config, relationMap);
      this.#attachedIds.push(g.id);
    }
  }

  ngOnDestroy(): void {
    this.#detachAll();
  }

  #detachAll(): void {
    const elementRef = (this.#el as any).element;
    if (!elementRef) return;
    for (const id of this.#attachedIds) {
      try {
        __RemoveGestureDetector(elementRef, id);
      } catch {
        // Element may already be destroyed by the native engine.
      }
    }
    this.#attachedIds = [];
  }

  #resolveGestures(): AnyGesture[] {
    if (!this.lynxGesture) return [];
    if (this.lynxGesture instanceof ComposedGesture) {
      return this.lynxGesture.gestures;
    }
    if (Array.isArray(this.lynxGesture)) {
      return this.lynxGesture;
    }
    return [this.lynxGesture];
  }
}

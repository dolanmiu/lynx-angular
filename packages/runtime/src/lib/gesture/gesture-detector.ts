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

/**
 * Directive that bridges Angular's gesture binding to Lynx's native gesture
 * system (__SetGestureDetector / __RemoveGestureDetector). Accepts a single
 * gesture, an array of gestures, or a ComposedGesture (simultaneous/exclusive).
 * Each gesture is registered with the native engine via its unique numeric ID.
 */
@Directive({
  selector: '[lynxGesture]',
  inputs: ['lynxGesture'],
})
export class LynxGestureDetector implements OnChanges, OnDestroy {
  readonly #el: BaseLynxElement = inject(ElementRef).nativeElement;
  #attachedIds: number[] = [];

  lynxGesture!: GestureInput;

  /**
   * Full teardown + re-register on every input change. This is safe because
   * gesture IDs are stable (assigned once in BaseGesture constructor), so
   * inter-gesture relationships (waitFor, simultaneousWith) stay valid.
   */
  ngOnChanges(_changes: SimpleChanges): void {
    this.#detachAll();
    const gestures = this.#resolveGestures();

    for (const g of gestures) {
      const elementRef = (this.#el as any).element;
      if (!elementRef) continue;

      // GestureStateManager allows callbacks to programmatically fail/activate
      // the gesture (e.g. to implement conditional gesture recognition).
      const stateManager = new GestureStateManager(elementRef, g.id);
      const config = {
        // Wrap each callback to inject the stateManager as the second argument.
        // The native engine calls callback(event); we forward as cb(event, stateManager).
        callbacks: Object.entries(g._callbacks).map(([name, cb]) => ({
          name,
          callback: (event: any) => (cb as any)(event, stateManager),
        })),
        config: Object.keys(g._config).length > 0 ? g._config : undefined,
      };
      // Relationship map tells the native gesture system how gestures interact:
      // - waitFor: this gesture waits for the dependency to fail before recognizing
      // - simultaneous: both gestures can be active at the same time
      // - continueWith: this gesture activates after the dependency ends
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

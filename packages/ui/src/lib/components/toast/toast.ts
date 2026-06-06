import type { ElementRef } from '@angular/core';
import {
  Component,
  ViewEncapsulation,
  computed,
  effect,
  signal,
  viewChild,
} from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

import { cn } from '../../utils/cn';
import { type ToastData, toasts } from './toast-state';

const ANIM_DURATION_IN = 300;
const ANIM_DURATION_OUT = 200;

@Component({
  selector: 'ui-toaster',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <overlay
      [attr.visible]="overlayVisible()"
      style="position: fixed; overflow: visible;"
    >
      <view
        style="position: absolute; bottom: 0; left: 0; right: 0;"
        class="flex flex-col items-center p-4"
      >
        @if (displayedToast(); as t) {
          <view #toastEl [class]="toastClass()" (bindtap)="dismiss()">
            <view class="flex flex-col gap-1 flex-1">
              @if (t.title) {
                <text [class]="titleClass()">{{ t.title }}</text>
              }
              @if (t.description) {
                <text [class]="descriptionClass()">{{ t.description }}</text>
              }
            </view>
            @if (t.action) {
              <view [class]="actionClass()" (catchtap)="onAction()">
                <text [class]="actionTextClass()">{{ t.action.label }}</text>
              </view>
            }
          </view>
        }
      </view>
    </overlay>
  `,
})
export class UiToaster {
  protected readonly displayedToast = signal<ToastData | null>(null);
  protected readonly overlayVisible = signal(false);

  readonly #toastElRef = viewChild<ElementRef>('toastEl');
  #toastAnim?: { cancel(): void };
  #dismissTimer: ReturnType<typeof setTimeout> | null = null;
  #isProcessing = false;

  constructor() {
    effect(() => {
      const queue = toasts();
      if (queue.length > 0 && !this.#isProcessing) {
        this.#processQueue();
      }
    });
  }

  protected readonly toastClass = computed(() => {
    const t = this.displayedToast();
    const isDestructive = t?.variant === 'destructive';
    return cn(
      'flex flex-row items-start gap-3 w-full rounded-lg border p-4',
      isDestructive
        ? 'bg-destructive border-destructive'
        : 'bg-background border-border',
    );
  });

  protected readonly titleClass = computed(() => {
    const t = this.displayedToast();
    const isDestructive = t?.variant === 'destructive';
    return cn(
      'text-sm font-semibold',
      isDestructive ? 'text-destructive-foreground' : 'text-foreground',
    );
  });

  protected readonly descriptionClass = computed(() => {
    const t = this.displayedToast();
    const isDestructive = t?.variant === 'destructive';
    return cn(
      'text-sm',
      isDestructive ? 'text-destructive-foreground' : 'text-muted-foreground',
    );
  });

  protected readonly actionClass = computed(() => {
    const t = this.displayedToast();
    const isDestructive = t?.variant === 'destructive';
    return cn(
      'flex items-center justify-center rounded-md border px-3 py-1.5',
      isDestructive ? 'border-destructive-foreground' : 'border-border',
    );
  });

  protected readonly actionTextClass = computed(() => {
    const t = this.displayedToast();
    const isDestructive = t?.variant === 'destructive';
    return cn(
      'text-sm font-medium',
      isDestructive ? 'text-destructive-foreground' : 'text-foreground',
    );
  });

  protected dismiss(): void {
    if (this.#dismissTimer) {
      clearTimeout(this.#dismissTimer);
      this.#dismissTimer = null;
    }
    this.#animateOut();
    setTimeout(() => {
      this.overlayVisible.set(false);
      this.displayedToast.set(null);
      this.#isProcessing = false;
      this.#processQueue();
    }, ANIM_DURATION_OUT + 20);
  }

  protected onAction(): void {
    this.displayedToast()?.action?.onAction();
    this.dismiss();
  }

  #processQueue(): void {
    const queue = toasts();
    if (queue.length === 0) {
      this.#isProcessing = false;
      return;
    }

    this.#isProcessing = true;
    const next = queue[0];
    toasts.update((list) => list.slice(1));
    this.displayedToast.set(next);
    this.#showToast(next);
  }

  #showToast(data: ToastData): void {
    setTimeout(() => {
      this.overlayVisible.set(true);
      setTimeout(() => {
        this.#animateIn();
        this.#dismissTimer = setTimeout(() => this.dismiss(), data.duration);
      }, 0);
    }, 0);
  }

  #animateIn(): void {
    const el = this.#toastElRef()?.nativeElement;
    if (!el) return;

    this.#toastAnim?.cancel();
    this.#toastAnim = el.animate(
      [
        { transform: 'translateY(100%)', opacity: 0 },
        { transform: 'translateY(0%)', opacity: 1 },
      ],
      {
        duration: ANIM_DURATION_IN,
        easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
        fill: 'forwards',
      },
    );
  }

  #animateOut(): void {
    const el = this.#toastElRef()?.nativeElement;
    if (!el) return;

    this.#toastAnim?.cancel();
    this.#toastAnim = el.animate(
      [
        { transform: 'translateY(0%)', opacity: 1 },
        { transform: 'translateY(100%)', opacity: 0 },
      ],
      { duration: ANIM_DURATION_OUT, easing: 'ease-in', fill: 'forwards' },
    );
  }
}

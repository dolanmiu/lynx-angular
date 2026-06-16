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

import { type AnimationHandle, DURATION, EASING } from '@blotch/dolan/utils/animate';
import { cn } from '@blotch/dolan/utils/cn';
import { type ToastData, toasts } from './toast-state';

@Component({
  selector: 'ui-toaster',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <overlay
      [attr.visible]="overlayVisible()"
      [style]="overlayStyle()"
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
  protected readonly overlayStyle = computed(() =>
    this.overlayVisible()
      ? 'position: fixed; overflow: visible;'
      : 'position: fixed; overflow: visible; display: none;',
  );

  readonly toastElRef = viewChild<ElementRef>('toastEl');
  #toastAnim?: AnimationHandle;
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
    }, DURATION.fast + 20);
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
    const el = this.toastElRef()?.nativeElement;
    if (!el) return;

    this.#toastAnim?.cancel();
    // Spring entrance — slide up with scale for a polished feel
    this.#toastAnim = el.animate(
      [
        { transform: 'translateY(100%) scale(0.95)', opacity: 0 },
        { transform: 'translateY(0%) scale(1)', opacity: 1 },
      ],
      {
        duration: DURATION.slow,
        easing: EASING.spring,
        fill: 'forwards',
      },
    );
  }

  #animateOut(): void {
    const el = this.toastElRef()?.nativeElement;
    if (!el) return;

    this.#toastAnim?.cancel();
    // Fast exit — slide down with opacity
    this.#toastAnim = el.animate(
      [
        { transform: 'translateY(0%) scale(1)', opacity: 1 },
        { transform: 'translateY(50%) scale(0.95)', opacity: 0 },
      ],
      { duration: DURATION.fast, easing: EASING.accelerate, fill: 'forwards' },
    );
  }
}

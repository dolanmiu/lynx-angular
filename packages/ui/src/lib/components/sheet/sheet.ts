import type { ElementRef } from '@angular/core';
import {
  Component,
  ViewEncapsulation,
  computed,
  effect,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

import {
  type AnimationHandle,
  DURATION,
  EASING,
  fadeIn,
  fadeOut,
  slideIn,
  slideOut,
} from '../../utils/animate';
import { cn } from '../../utils/cn';

@Component({
  selector: 'ui-sheet',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <overlay [attr.visible]="overlayVisible()" [style]="overlayStyle()">
      <view #backdrop class="w-full h-full" (bindtap)="onBackdropTap()">
        <view
          #panel
          [class]="panelClass()"
          [style]="panelPositionStyle()"
          (catchtap)="$event.stopPropagation()"
        >
          <view class="flex items-center justify-center pt-2 pb-4">
            <view class="h-1 w-10 rounded-full bg-muted" />
          </view>
          <ng-content />
        </view>
      </view>
    </overlay>
  `,
})
export class UiSheet {
  readonly open = model(false);
  readonly userClass = input<string>('', { alias: 'class' });

  readonly closed = output<void>();

  protected readonly overlayVisible = signal(false);
  protected readonly overlayStyle = computed(() =>
    this.overlayVisible()
      ? 'position: fixed; overflow: visible;'
      : 'position: fixed; overflow: visible; display: none;',
  );

  readonly backdropRef = viewChild<ElementRef>('backdrop');
  readonly panelRef = viewChild<ElementRef>('panel');
  #backdropAnim?: AnimationHandle;
  #panelAnim?: AnimationHandle;
  #hasBeenOpen = false;

  constructor() {
    // `#hasBeenOpen` prevents the close animation from running on the initial
    // effect evaluation when `open` starts as false. Without this guard, the
    // first run would call #doClose() and emit `closed` before the sheet
    // has ever been opened.
    effect(() => {
      const isOpen = this.open();
      if (isOpen) {
        this.#hasBeenOpen = true;
        this.#doOpen();
      } else if (this.#hasBeenOpen) {
        this.#doClose();
      }
    });
  }

  protected readonly panelClass = computed(() =>
    cn(
      'flex flex-col bg-background rounded-t-lg border-t border-border px-6 pb-6',
      'w-full',
      this.userClass(),
    ),
  );

  protected readonly panelPositionStyle = computed(
    () => 'position: absolute; bottom: 0; left: 0; right: 0;',
  );

  protected onBackdropTap(): void {
    this.open.set(false);
  }

  /**
   * Two-phase open: make the overlay visible first so native elements exist
   * in the tree, then animate on the next frame. Without this, animate()
   * targets elements that haven't been flushed to native yet and silently fails.
   */
  #doOpen(): void {
    setTimeout(() => {
      this.overlayVisible.set(true);
      setTimeout(() => this.#animateIn(), 0);
    }, 0);
  }

  /**
   * Reverse: animate out first, then hide the overlay once the animation
   * completes. The +20ms buffer absorbs timer imprecision in the Lynx
   * runtime — hiding the overlay mid-animation causes elements to vanish
   * before the fade finishes.
   */
  #doClose(): void {
    setTimeout(() => {
      this.#animateOut();
      setTimeout(() => {
        this.overlayVisible.set(false);
        this.closed.emit();
      }, DURATION.normal + 20);
    }, 0);
  }

  #animateIn(): void {
    const backdrop = this.backdropRef()?.nativeElement;
    const panel = this.panelRef()?.nativeElement;
    if (!backdrop || !panel) return;

    this.#backdropAnim?.cancel();
    this.#panelAnim?.cancel();

    this.#backdropAnim = fadeIn(backdrop, { duration: DURATION.normal });
    this.#panelAnim = slideIn(panel, 'up', {
      duration: DURATION.slow,
      easing: EASING.sheet,
    });
  }

  #animateOut(): void {
    const backdrop = this.backdropRef()?.nativeElement;
    const panel = this.panelRef()?.nativeElement;
    if (!backdrop || !panel) return;

    this.#backdropAnim?.cancel();
    this.#panelAnim?.cancel();

    this.#backdropAnim = fadeOut(backdrop, { duration: DURATION.normal });
    this.#panelAnim = slideOut(panel, 'down', {
      duration: DURATION.normal,
      easing: EASING.accelerate,
    });
  }
}

@Component({
  selector: 'ui-sheet-header',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view [class]="containerClass()">
      <ng-content />
    </view>
  `,
})
export class UiSheetHeader {
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly containerClass = computed(() =>
    cn('flex flex-col gap-1.5 mb-4', this.userClass()),
  );
}

@Component({
  selector: 'ui-sheet-title',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `<text [class]="textClass()"><ng-content /></text>`,
})
export class UiSheetTitle {
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly textClass = computed(() =>
    cn('text-lg font-semibold text-foreground', this.userClass()),
  );
}

@Component({
  selector: 'ui-sheet-description',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `<text [class]="textClass()"><ng-content /></text>`,
})
export class UiSheetDescription {
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly textClass = computed(() =>
    cn('text-sm text-muted-foreground', this.userClass()),
  );
}

@Component({
  selector: 'ui-sheet-footer',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view [class]="containerClass()">
      <ng-content />
    </view>
  `,
})
export class UiSheetFooter {
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly containerClass = computed(() =>
    cn('flex flex-col gap-2 pt-4', this.userClass()),
  );
}

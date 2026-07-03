import {
  type ElementRef,
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
  SCALE,
  fadeIn,
  fadeOut,
  scaleIn,
  scaleOut,
} from '../../utils/animate';
import { cn } from '../../utils/cn';

@Component({
  selector: 'ui-alert-dialog',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <overlay [attr.visible]="overlayVisible()" [style]="overlayStyle()">
      <view #backdrop [class]="backdropClass()">
        <view #panel [class]="panelClass()" (catchtap)="onPanelTap()">
          <ng-content />
        </view>
      </view>
    </overlay>
  `,
})
export class UiAlertDialog {
  readonly open = model(false);
  readonly userClass = input<string>('', { alias: 'class' });

  readonly closed = output<void>();

  protected readonly overlayVisible = signal(false);

  readonly backdropRef = viewChild<ElementRef>('backdrop');
  readonly panelRef = viewChild<ElementRef>('panel');
  #backdropAnim?: AnimationHandle;
  #panelAnim?: AnimationHandle;
  #hasBeenOpen = false;

  constructor() {
    // `#hasBeenOpen` prevents the close animation from running on the initial
    // effect evaluation when `open` starts as false. Without this guard, the
    // first run would call #doClose() immediately and emit `closed` before the
    // dialog has ever been opened.
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

  protected readonly overlayStyle = computed(() =>
    this.overlayVisible()
      ? 'position: fixed; overflow: visible;'
      : 'position: fixed; overflow: visible; display: none;',
  );

  protected readonly backdropClass = computed(() =>
    cn('flex items-center justify-center', 'w-full h-full'),
  );

  protected readonly panelClass = computed(() =>
    cn(
      'flex flex-col bg-background rounded-lg border border-border p-6 w-4/5',
      this.userClass(),
    ),
  );

  /**
   * No-op tap handler for the panel. `catchtap` (vs `bindtap`) already stops
   * the tap from bubbling to the backdrop — Lynx controls propagation via the
   * event prefix, not at runtime. (The renderer shims `event.stopPropagation()`
   * as a no-op so DOM-style handlers don't crash, but it has no effect here.)
   */
  protected onPanelTap(): void {}

  /**
   * Two-phase open: make overlay visible first (so native elements exist in
   * the tree), then animate on the next frame. See nav-drawer for the same
   * pattern — Lynx animate() requires elements to be mounted before use.
   */
  #doOpen(): void {
    setTimeout(() => {
      this.overlayVisible.set(true);
      setTimeout(() => this.#animateIn(), 0);
    }, 0);
  }

  /**
   * Animate out before hiding; +20ms guards against Lynx timer imprecision
   * causing elements to disappear before the animation finishes.
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

    // 30ms stagger: let the backdrop fade start first so the panel scale-in
    // feels like it's emerging from behind the dimmed overlay rather than
    // appearing simultaneously with it.
    setTimeout(() => {
      this.#panelAnim = scaleIn(panel, {
        duration: DURATION.slow,
        easing: EASING.springSubtle,
        fromScale: SCALE.dialogFrom,
        fromY: 10,
      });
    }, 30);
  }

  #animateOut(): void {
    const backdrop = this.backdropRef()?.nativeElement;
    const panel = this.panelRef()?.nativeElement;
    if (!backdrop || !panel) return;

    this.#backdropAnim?.cancel();
    this.#panelAnim?.cancel();

    this.#panelAnim = scaleOut(panel, {
      duration: 180,
      easing: EASING.accelerate,
      toScale: SCALE.dialogTo,
      toY: 10,
    });

    this.#backdropAnim = fadeOut(backdrop, { duration: DURATION.normal });
  }
}

@Component({
  selector: 'ui-alert-dialog-header',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view [class]="containerClass()">
      <ng-content />
    </view>
  `,
})
export class UiAlertDialogHeader {
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly containerClass = computed(() =>
    cn('flex flex-col gap-1.5', this.userClass()),
  );
}

@Component({
  selector: 'ui-alert-dialog-title',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `<text [class]="textClass()"><ng-content /></text>`,
})
export class UiAlertDialogTitle {
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly textClass = computed(() =>
    cn('text-lg font-semibold text-foreground', this.userClass()),
  );
}

@Component({
  selector: 'ui-alert-dialog-description',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `<text [class]="textClass()"><ng-content /></text>`,
})
export class UiAlertDialogDescription {
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly textClass = computed(() =>
    cn('text-sm text-muted-foreground', this.userClass()),
  );
}

@Component({
  selector: 'ui-alert-dialog-footer',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view [class]="containerClass()">
      <ng-content />
    </view>
  `,
})
export class UiAlertDialogFooter {
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly containerClass = computed(() =>
    cn('flex flex-row justify-end gap-2 pt-4', this.userClass()),
  );
}

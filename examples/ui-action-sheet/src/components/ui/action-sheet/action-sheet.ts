import type { ElementRef } from '@angular/core';
import {
  Component,
  ViewEncapsulation,
  computed,
  effect,
  inject,
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
  pressDown,
  pressRelease,
  slideIn,
  slideOut,
} from '@blotch/dolan/utils/animate';
import { cn } from '@blotch/dolan/utils/cn';

@Component({
  selector: 'ui-action-sheet',
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
          <view class="flex flex-col rounded-lg bg-card overflow-hidden">
            <ng-content />
          </view>
          <ng-content select="ui-action-sheet-cancel" />
        </view>
      </view>
    </overlay>
  `,
})
export class UiActionSheet {
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
    cn('flex flex-col gap-2 w-full px-4 pb-6', this.userClass()),
  );

  protected readonly panelPositionStyle = computed(
    () => 'position: absolute; bottom: 0; left: 0; right: 0;',
  );

  protected onBackdropTap(): void {
    this.open.set(false);
  }

  close(): void {
    this.open.set(false);
  }

  #doOpen(): void {
    setTimeout(() => {
      this.overlayVisible.set(true);
      setTimeout(() => this.#animateIn(), 0);
    }, 0);
  }

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
  selector: 'ui-action-sheet-title',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view [class]="containerClass()">
      <text [class]="textClass()"><ng-content /></text>
    </view>
  `,
})
export class UiActionSheetTitle {
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly containerClass = computed(() =>
    cn('flex items-center justify-center py-3 px-4', this.userClass()),
  );

  protected readonly textClass = computed(() =>
    cn('text-sm text-muted-foreground'),
  );
}

@Component({
  selector: 'ui-action-sheet-item',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view
      #container
      [class]="containerClass()"
      (bindtouchstart)="onPressStart()"
      (bindtouchend)="onPressEnd()"
      (bindtouchcancel)="onPressCancel()"
      (bindtap)="onTap()"
    >
      <text [class]="textClass()"><ng-content /></text>
    </view>
  `,
})
export class UiActionSheetItem {
  readonly #sheet = inject(UiActionSheet);

  readonly variant = input<'default' | 'destructive'>('default');
  readonly userClass = input<string>('', { alias: 'class' });

  readonly pressed = output<void>();

  readonly containerRef = viewChild<ElementRef>('container');
  #pressAnim?: AnimationHandle;

  protected readonly containerClass = computed(() =>
    cn(
      'flex items-center justify-center py-3 px-4 border-t border-border',
      this.userClass(),
    ),
  );

  protected readonly textClass = computed(() =>
    cn(
      'text-base',
      this.variant() === 'destructive' ? 'text-destructive' : 'text-primary',
    ),
  );

  protected onPressStart(): void {
    this.#pressAnim?.cancel();
    this.#pressAnim = pressDown(
      this.containerRef()?.nativeElement,
      SCALE.pressDownLight,
    );
  }

  protected onPressEnd(): void {
    this.#pressAnim?.cancel();
    this.#pressAnim = pressRelease(this.containerRef()?.nativeElement);
  }

  protected onPressCancel(): void {
    this.#pressAnim?.cancel();
    this.#pressAnim = pressRelease(this.containerRef()?.nativeElement);
  }

  protected onTap(): void {
    this.pressed.emit();
    this.#sheet.close();
  }
}

@Component({
  selector: 'ui-action-sheet-cancel',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view
      #container
      [class]="containerClass()"
      (bindtouchstart)="onPressStart()"
      (bindtouchend)="onPressEnd()"
      (bindtouchcancel)="onPressCancel()"
      (bindtap)="onTap()"
    >
      <text [class]="textClass()">{{ label() }}</text>
    </view>
  `,
})
export class UiActionSheetCancel {
  readonly #sheet = inject(UiActionSheet);

  readonly label = input('Cancel');
  readonly userClass = input<string>('', { alias: 'class' });

  readonly containerRef = viewChild<ElementRef>('container');
  #pressAnim?: AnimationHandle;

  protected readonly containerClass = computed(() =>
    cn(
      'flex items-center justify-center py-3 px-4 rounded-lg bg-card',
      this.userClass(),
    ),
  );

  protected readonly textClass = computed(() =>
    cn('text-base font-semibold text-primary'),
  );

  protected onPressStart(): void {
    this.#pressAnim?.cancel();
    this.#pressAnim = pressDown(
      this.containerRef()?.nativeElement,
      SCALE.pressDownLight,
    );
  }

  protected onPressEnd(): void {
    this.#pressAnim?.cancel();
    this.#pressAnim = pressRelease(this.containerRef()?.nativeElement);
  }

  protected onPressCancel(): void {
    this.#pressAnim?.cancel();
    this.#pressAnim = pressRelease(this.containerRef()?.nativeElement);
  }

  protected onTap(): void {
    this.#sheet.close();
  }
}

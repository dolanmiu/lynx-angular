import {
  type ElementRef,
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
import { UiIcon } from '../icon';

@Component({
  selector: 'ui-nav-drawer',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <overlay [attr.visible]="overlayVisible()" [style]="overlayStyle()">
      <view #backdrop class="h-full w-full" (bindtap)="onBackdropTap()">
        <view
          #panel
          [class]="panelClass()"
          [style]="panelPositionStyle()"
          (catchtap)="onPanelTap()"
        >
          <ng-content />
        </view>
      </view>
    </overlay>
  `,
})
export class UiNavDrawer {
  readonly open = model(false);
  readonly side = input<'left' | 'right'>('left');
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
    cn(
      'h-full flex-col bg-background flex',
      this.side() === 'left'
        ? 'border-r border-border'
        : 'border-l border-border',
      this.userClass(),
    ),
  );

  protected readonly panelPositionStyle = computed(() => {
    const sideValue = this.side();
    return sideValue === 'left'
      ? 'position: absolute; top: 0; bottom: 0; left: 0; width: 80%;'
      : 'position: absolute; top: 0; bottom: 0; right: 0; width: 80%;';
  });

  protected onBackdropTap(): void {
    this.open.set(false);
  }

  /**
   * No-op tap handler for the panel. `catchtap` (vs `bindtap`) already stops
   * the tap from bubbling to the backdrop — Lynx controls propagation via the
   * event prefix, not at runtime. (The renderer shims `event.stopPropagation()`
   * as a no-op so DOM-style handlers don't crash, but it has no effect here.)
   */
  protected onPanelTap(): void {}

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
    const direction = this.side() === 'left' ? 'left' : 'right';
    this.#panelAnim = slideIn(panel, direction, {
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
    const direction = this.side() === 'left' ? 'left' : 'right';
    this.#panelAnim = slideOut(panel, direction, {
      duration: DURATION.normal,
      easing: EASING.accelerate,
    });
  }
}

@Component({
  selector: 'ui-nav-drawer-header',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view [class]="containerClass()">
      <ng-content />
    </view>
  `,
})
export class UiNavDrawerHeader {
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly containerClass = computed(() =>
    cn('flex-col gap-1.5 border-b border-border p-4 flex', this.userClass()),
  );
}

@Component({
  selector: 'ui-nav-drawer-content',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <scroll-view scroll-orientation="vertical" [class]="contentClass()">
      <ng-content />
    </scroll-view>
  `,
})
export class UiNavDrawerContent {
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly contentClass = computed(() =>
    cn('flex-1', this.userClass()),
  );
}

@Component({
  selector: 'ui-nav-drawer-item',
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
      <ng-content />
    </view>
  `,
})
export class UiNavDrawerItem {
  readonly #drawer = inject(UiNavDrawer);

  readonly variant = input<'default' | 'destructive'>('default');
  readonly active = input(false);
  readonly autoClose = input(true);
  readonly userClass = input<string>('', { alias: 'class' });

  readonly pressed = output<void>();

  readonly containerRef = viewChild<ElementRef>('container');
  #pressAnim?: AnimationHandle;

  protected readonly containerClass = computed(() =>
    cn(
      'flex-row items-center gap-3 px-4 py-3 flex',
      this.active() ? 'bg-accent' : 'bg-transparent',
      this.userClass(),
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
    if (this.autoClose()) {
      this.#drawer.close();
    }
  }
}

@Component({
  selector: 'ui-nav-drawer-footer',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view [class]="containerClass()">
      <ng-content />
    </view>
  `,
})
export class UiNavDrawerFooter {
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly containerClass = computed(() =>
    cn('flex-col gap-2 border-t border-border p-4 flex', this.userClass()),
  );
}

@Component({
  selector: 'ui-nav-drawer-trigger',
  standalone: true,
  imports: [LYNX_ELEMENTS, UiIcon],
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
      <ui-icon name="menu" size="md" />
    </view>
  `,
})
export class UiNavDrawerTrigger {
  readonly userClass = input<string>('', { alias: 'class' });

  readonly pressed = output<void>();

  readonly containerRef = viewChild<ElementRef>('container');
  #pressAnim?: AnimationHandle;

  protected readonly containerClass = computed(() =>
    cn(
      'h-10 w-10 items-center rounded-md flex justify-center',
      this.userClass(),
    ),
  );

  protected onPressStart(): void {
    this.#pressAnim?.cancel();
    this.#pressAnim = pressDown(this.containerRef()?.nativeElement);
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
  }
}

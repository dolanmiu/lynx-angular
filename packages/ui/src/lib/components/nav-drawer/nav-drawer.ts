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

import { cn } from '../../utils/cn';
import { UiIcon } from '../icon';

const ANIM_DURATION_IN = 300;
const ANIM_DURATION_OUT = 200;

@Component({
  selector: 'ui-nav-drawer',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <overlay
      [attr.visible]="overlayVisible()"
      style="position: fixed; overflow: visible;"
    >
      <view #backdrop class="w-full h-full" (bindtap)="onBackdropTap()">
        <view
          #panel
          [class]="panelClass()"
          [style]="panelPositionStyle()"
          (catchtap)="$event.stopPropagation()"
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

  readonly backdropRef = viewChild<ElementRef>('backdrop');
  readonly panelRef = viewChild<ElementRef>('panel');
  #backdropAnim?: { cancel(): void };
  #panelAnim?: { cancel(): void };
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
      'flex flex-col bg-background h-full',
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
      }, ANIM_DURATION_OUT + 20);
    }, 0);
  }

  #animateIn(): void {
    const backdrop = this.backdropRef()?.nativeElement;
    const panel = this.panelRef()?.nativeElement;
    if (!backdrop || !panel) return;

    this.#backdropAnim?.cancel();
    this.#panelAnim?.cancel();

    this.#backdropAnim = backdrop.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 250,
      easing: 'ease-out',
      fill: 'forwards',
    });

    const offscreen = this.side() === 'left' ? '-100%' : '100%';
    this.#panelAnim = panel.animate(
      [
        { transform: `translateX(${offscreen})` },
        { transform: 'translateX(0%)' },
      ],
      {
        duration: ANIM_DURATION_IN,
        easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
        fill: 'forwards',
      },
    );
  }

  #animateOut(): void {
    const backdrop = this.backdropRef()?.nativeElement;
    const panel = this.panelRef()?.nativeElement;
    if (!backdrop || !panel) return;

    this.#backdropAnim?.cancel();
    this.#panelAnim?.cancel();

    this.#backdropAnim = backdrop.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: ANIM_DURATION_OUT,
      easing: 'ease-in',
      fill: 'forwards',
    });

    const offscreen = this.side() === 'left' ? '-100%' : '100%';
    this.#panelAnim = panel.animate(
      [
        { transform: 'translateX(0%)' },
        { transform: `translateX(${offscreen})` },
      ],
      { duration: ANIM_DURATION_OUT, easing: 'ease-in', fill: 'forwards' },
    );
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
    cn('flex flex-col gap-1.5 p-4 border-b border-border', this.userClass()),
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
    <view [class]="containerClass()" (bindtap)="onTap()">
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

  protected readonly containerClass = computed(() =>
    cn(
      'flex flex-row items-center gap-3 px-4 py-3 active:opacity-80',
      this.active() ? 'bg-accent' : 'bg-transparent',
      this.userClass(),
    ),
  );

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
    cn('flex flex-col gap-2 p-4 border-t border-border', this.userClass()),
  );
}

@Component({
  selector: 'ui-nav-drawer-trigger',
  standalone: true,
  imports: [LYNX_ELEMENTS, UiIcon],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view [class]="containerClass()" (bindtap)="onTap()">
      <ui-icon name="menu" size="md" />
    </view>
  `,
})
export class UiNavDrawerTrigger {
  readonly userClass = input<string>('', { alias: 'class' });

  readonly pressed = output<void>();

  protected readonly containerClass = computed(() =>
    cn(
      'flex items-center justify-center w-10 h-10 rounded-md active:opacity-80',
      this.userClass(),
    ),
  );

  protected onTap(): void {
    this.pressed.emit();
  }
}

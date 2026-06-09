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

import { cn } from '../../utils/cn';

const ANIM_DURATION_IN = 300;
const ANIM_DURATION_OUT = 200;

@Component({
  selector: 'ui-dialog',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <overlay
      [attr.visible]="overlayVisible()"
      style="position: fixed; overflow: visible;"
    >
      <view #backdrop [class]="backdropClass()" (bindtap)="onBackdropTap()">
        <view
          #panel
          [class]="panelClass()"
          (catchtap)="$event.stopPropagation()"
        >
          <ng-content />
        </view>
      </view>
    </overlay>
  `,
})
export class UiDialog {
  readonly open = model(false);
  readonly userClass = input<string>('', { alias: 'class' });

  readonly closed = output<void>();

  protected readonly overlayVisible = signal(false);

  private readonly backdropRef = viewChild<ElementRef>('backdrop');
  private readonly panelRef = viewChild<ElementRef>('panel');
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

  protected readonly backdropClass = computed(() =>
    cn('flex items-center justify-center', 'w-full h-full'),
  );

  protected readonly panelClass = computed(() =>
    cn(
      'flex flex-col bg-background rounded-lg border border-border p-6 w-4/5',
      this.userClass(),
    ),
  );

  protected onBackdropTap(): void {
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

    this.#panelAnim = panel.animate(
      [
        { transform: 'scale(0.85) translateY(20px)', opacity: 0 },
        { transform: 'scale(1) translateY(0px)', opacity: 1 },
      ],
      {
        duration: ANIM_DURATION_IN,
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
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

    this.#panelAnim = panel.animate(
      [
        { transform: 'scale(1) translateY(0px)', opacity: 1 },
        { transform: 'scale(0.85) translateY(20px)', opacity: 0 },
      ],
      { duration: ANIM_DURATION_OUT, easing: 'ease-in', fill: 'forwards' },
    );
  }
}

@Component({
  selector: 'ui-dialog-header',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view [class]="containerClass()">
      <ng-content />
    </view>
  `,
})
export class UiDialogHeader {
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly containerClass = computed(() =>
    cn('flex flex-col gap-1.5', this.userClass()),
  );
}

@Component({
  selector: 'ui-dialog-title',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `<text [class]="textClass()"><ng-content /></text>`,
})
export class UiDialogTitle {
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly textClass = computed(() =>
    cn('text-lg font-semibold text-foreground', this.userClass()),
  );
}

@Component({
  selector: 'ui-dialog-description',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `<text [class]="textClass()"><ng-content /></text>`,
})
export class UiDialogDescription {
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly textClass = computed(() =>
    cn('text-sm text-muted-foreground', this.userClass()),
  );
}

@Component({
  selector: 'ui-dialog-footer',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view [class]="containerClass()">
      <ng-content />
    </view>
  `,
})
export class UiDialogFooter {
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly containerClass = computed(() =>
    cn('flex flex-row justify-end gap-2 pt-4', this.userClass()),
  );
}

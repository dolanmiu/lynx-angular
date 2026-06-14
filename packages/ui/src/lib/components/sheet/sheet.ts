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
  selector: 'ui-sheet',
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
      [{ transform: 'translateY(100%)' }, { transform: 'translateY(0%)' }],
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

    this.#panelAnim = panel.animate(
      [{ transform: 'translateY(0%)' }, { transform: 'translateY(100%)' }],
      { duration: ANIM_DURATION_OUT, easing: 'ease-in', fill: 'forwards' },
    );
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

import type { ElementRef } from '@angular/core';
import {
  Component,
  ViewEncapsulation,
  computed,
  contentChildren,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

import { cn } from '../../utils/cn';

const CHEVRON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;
const CHECK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;

const ANIM_DURATION_IN = 300;
const ANIM_DURATION_OUT = 200;

@Component({
  selector: 'ui-select',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view [class]="triggerClass()" (bindtap)="toggle()">
      <text [class]="valueTextClass()">{{ displayText() }}</text>
      <svg [attr.content]="chevronSvg" style="width: 16px; height: 16px;" />
    </view>
    <overlay
      [attr.visible]="overlayVisible()"
      style="position: fixed; overflow: visible;"
    >
      <view #backdrop class="w-full h-full" (bindtap)="close()">
        <view
          #panel
          [class]="panelClass()"
          style="position: absolute; bottom: 0; left: 0; right: 0;"
          (catchtap)="$event.stopPropagation()"
        >
          <view class="flex items-center justify-center pt-2 pb-3">
            <view class="h-1 w-10 rounded-full bg-muted" />
          </view>
          <scroll-view scroll-orientation="vertical" style="max-height: 300px;">
            <view class="flex flex-col pb-4">
              <ng-content />
            </view>
          </scroll-view>
        </view>
      </view>
    </overlay>
  `,
})
export class UiSelect {
  readonly value = model<string>('');
  readonly placeholder = input('Select...');
  readonly disabled = input(false);
  readonly userClass = input<string>('', { alias: 'class' });

  readonly changed = output<string>();

  protected readonly overlayVisible = signal(false);
  protected readonly chevronSvg = CHEVRON_SVG;

  private readonly itemRefs = contentChildren(forwardRef(() => UiSelectItem));
  private readonly backdropRef = viewChild<ElementRef>('backdrop');
  private readonly panelRef = viewChild<ElementRef>('panel');
  #backdropAnim?: { cancel(): void };
  #panelAnim?: { cancel(): void };
  #isOpen = false;

  protected readonly displayText = computed(() => {
    const val = this.value();
    if (!val) return this.placeholder();
    const item = this.itemRefs().find((i) => i.itemValue() === val);
    return item?.label() ?? val;
  });

  protected readonly triggerClass = computed(() =>
    cn(
      'flex flex-row items-center justify-between rounded-md border border-input bg-background px-3 py-2 h-10',
      'active:opacity-80',
      this.disabled() && 'opacity-50 active:opacity-50',
      this.userClass(),
    ),
  );

  protected readonly valueTextClass = computed(() => {
    const val = this.value();
    return cn(
      'text-sm flex-1',
      val ? 'text-foreground' : 'text-muted-foreground',
    );
  });

  protected readonly panelClass = computed(() =>
    cn('flex flex-col bg-background rounded-t-lg border-t border-border'),
  );

  select(value: string): void {
    this.value.set(value);
    this.changed.emit(value);
    this.close();
  }

  toggle(): void {
    if (this.disabled()) return;
    if (this.#isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    if (this.#isOpen) return;
    this.#isOpen = true;
    setTimeout(() => {
      this.overlayVisible.set(true);
      setTimeout(() => this.#animateIn(), 0);
    }, 0);
  }

  close(): void {
    if (!this.#isOpen) return;
    this.#isOpen = false;
    this.#animateOut();
    setTimeout(() => {
      this.overlayVisible.set(false);
    }, ANIM_DURATION_OUT + 20);
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
  selector: 'ui-select-item',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view [class]="containerClass()" (bindtap)="onTap()">
      <text [class]="labelClass()">{{ label() }}</text>
      @if (isSelected()) {
        <svg [attr.content]="checkSvg" style="width: 16px; height: 16px;" />
      }
    </view>
  `,
})
export class UiSelectItem {
  readonly #select = inject(UiSelect);

  readonly itemValue = input.required<string>({ alias: 'value' });
  readonly label = input.required<string>();
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly checkSvg = CHECK_SVG;

  protected readonly isSelected = computed(
    () => this.#select.value() === this.itemValue(),
  );

  protected readonly containerClass = computed(() =>
    cn(
      'flex flex-row items-center justify-between px-4 py-3 active:opacity-80',
      this.isSelected() && 'bg-accent',
      this.userClass(),
    ),
  );

  protected readonly labelClass = computed(() => cn('text-sm text-foreground'));

  protected onTap(): void {
    this.#select.select(this.itemValue());
  }
}

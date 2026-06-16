import type { ElementRef } from '@angular/core';
import {
  Component,
  ViewEncapsulation,
  computed,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

import { type AnimationHandle, springTranslateX } from '../../utils/animate';
import { cn } from '../../utils/cn';

const THUMB_OFFSET_OFF = 2;
const THUMB_OFFSET_ON = 22;

@Component({
  selector: 'ui-switch',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view [class]="trackClass()" (bindtap)="toggle()">
      <view #thumb [class]="thumbClass()" [style]="thumbPositionStyle()" />
    </view>
  `,
})
export class UiSwitch {
  readonly checked = model(false);
  readonly disabled = input(false);
  readonly userClass = input<string>('', { alias: 'class' });

  readonly changed = output<boolean>();

  readonly thumbRef = viewChild<ElementRef>('thumb');
  #activeAnimation?: AnimationHandle;

  protected readonly trackClass = computed(() =>
    cn(
      'flex flex-row items-center w-11 h-6 rounded-full',
      this.checked() ? 'bg-primary' : 'bg-input',
      this.disabled() && 'opacity-50',
      this.userClass(),
    ),
  );

  protected readonly thumbClass = computed(() =>
    cn('w-5 h-5 rounded-full bg-background'),
  );

  protected readonly thumbPositionStyle = computed(
    () =>
      `transform: translateX(${this.checked() ? THUMB_OFFSET_ON : THUMB_OFFSET_OFF}px);`,
  );

  toggle(): void {
    if (this.disabled()) return;

    const thumb = this.thumbRef()?.nativeElement;
    const wasChecked = this.checked();
    const next = !wasChecked;

    if (thumb) {
      this.#activeAnimation?.cancel();
      const from = wasChecked ? THUMB_OFFSET_ON : THUMB_OFFSET_OFF;
      const to = next ? THUMB_OFFSET_ON : THUMB_OFFSET_OFF;
      // Spring translate with squish effect at midpoint
      this.#activeAnimation = springTranslateX(thumb, from, to);
    }

    this.checked.set(next);
    this.changed.emit(next);
  }
}

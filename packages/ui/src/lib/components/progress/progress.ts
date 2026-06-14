import type { ElementRef } from '@angular/core';
import {
  Component,
  ViewEncapsulation,
  computed,
  effect,
  input,
  viewChild,
} from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

import { cn } from '../../utils/cn';

@Component({
  selector: 'ui-progress',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view [class]="trackClass()">
      <view #fill [class]="fillClass()" [style]="fillStyle()" />
    </view>
  `,
})
export class UiProgress {
  readonly value = input(0);
  readonly max = input(100);
  readonly userClass = input<string>('', { alias: 'class' });

  readonly fillRef = viewChild<ElementRef>('fill');
  #fillAnim?: { cancel(): void };
  #previousPercent: number | null = null;

  constructor() {
    effect(() => {
      const percent = this.percent();
      const el = this.fillRef()?.nativeElement;
      if (!el || this.#previousPercent === null) {
        this.#previousPercent = percent;
        return;
      }
      if (percent === this.#previousPercent) return;

      this.#fillAnim?.cancel();
      this.#fillAnim = el.animate(
        [{ width: `${this.#previousPercent}%` }, { width: `${percent}%` }],
        { duration: 200, easing: 'ease-out', fill: 'forwards' },
      );
      this.#previousPercent = percent;
    });
  }

  protected readonly percent = computed(() => {
    const m = this.max();
    if (m <= 0) return 0;
    return Math.min(100, Math.max(0, (this.value() / m) * 100));
  });

  protected readonly trackClass = computed(() =>
    cn(
      'w-full h-2 rounded-full bg-primary/20 overflow-hidden',
      this.userClass(),
    ),
  );

  protected readonly fillClass = computed(() =>
    cn('h-full rounded-full bg-primary'),
  );

  protected readonly fillStyle = computed(() => `width: ${this.percent()}%;`);
}

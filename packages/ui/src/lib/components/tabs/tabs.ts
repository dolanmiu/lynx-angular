import {
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

import { cn } from '../../utils/cn';

@Component({
  selector: 'ui-tabs',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view [class]="containerClass()">
      <ng-content />
    </view>
  `,
})
export class UiTabs {
  readonly value = model<string>('');
  readonly userClass = input<string>('', { alias: 'class' });

  readonly changed = output<string>();

  protected readonly containerClass = computed(() =>
    cn('flex flex-col', this.userClass()),
  );

  select(value: string): void {
    this.value.set(value);
    this.changed.emit(value);
  }
}

@Component({
  selector: 'ui-tabs-list',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view [class]="listClass()">
      <ng-content />
    </view>
  `,
})
export class UiTabsList {
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly listClass = computed(() =>
    cn('flex flex-row items-center rounded-md bg-muted p-1', this.userClass()),
  );
}

@Component({
  selector: 'ui-tabs-trigger',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view [class]="triggerClass()" (bindtap)="select()">
      <text [class]="textClass()"><ng-content /></text>
    </view>
  `,
})
export class UiTabsTrigger {
  readonly #tabs = inject(UiTabs);

  readonly triggerValue = input.required<string>({ alias: 'value' });
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly isActive = computed(
    () => this.#tabs.value() === this.triggerValue(),
  );

  protected readonly triggerClass = computed(() =>
    cn(
      'flex-1 flex items-center justify-center rounded-sm px-3 py-1.5 active:opacity-80',
      this.isActive() ? 'bg-background' : 'bg-transparent',
      this.userClass(),
    ),
  );

  protected readonly textClass = computed(() =>
    cn(
      'text-sm font-medium',
      this.isActive() ? 'text-foreground' : 'text-muted-foreground',
    ),
  );

  select(): void {
    this.#tabs.select(this.triggerValue());
  }
}

@Component({
  selector: 'ui-tabs-content',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (isActive()) {
      <view [class]="contentClass()">
        <ng-content />
      </view>
    }
  `,
})
export class UiTabsContent {
  readonly #tabs = inject(UiTabs);

  readonly contentValue = input.required<string>({ alias: 'value' });
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly isActive = computed(
    () => this.#tabs.value() === this.contentValue(),
  );

  protected readonly contentClass = computed(() =>
    cn('flex flex-col mt-2', this.userClass()),
  );
}

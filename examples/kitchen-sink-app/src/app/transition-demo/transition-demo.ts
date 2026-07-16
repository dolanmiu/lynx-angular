import { Component, signal } from '@angular/core';
import {
  LYNX_ELEMENTS,
  LynxTransition,
  LynxTransitionGroup,
} from '@blotch/angular-lynx';
import { DemoScreen } from '../demo-screen/demo-screen';
import { ScreenHost } from '../screen-host';

type Item = { id: number; label: string };

@Component({
  selector: 'app-transition-demo',
  hostDirectives: [ScreenHost],
  standalone: true,
  imports: [LYNX_ELEMENTS, LynxTransition, LynxTransitionGroup, DemoScreen],
  styleUrl: './transition-demo.css',
  template: `
    <app-demo-screen
      heading="Transitions"
      category="Motion"
      description="CSS transition animations."
    >
      <view class="container">
        <!-- LynxTransition -->
        <text class="section-title">LynxTransition</text>
        <view class="btn" (bindtap)="togglePanel()">
          <text class="btn-text"
            >{{ showPanel() ? 'Hide' : 'Show' }} Panel</text
          >
        </view>
        <lynx-transition [show]="showPanel()" name="fade" [duration]="300">
          <view class="panel">
            <text class="panel-text">Fades and slides in/out</text>
          </view>
        </lynx-transition>

        <!-- LynxTransitionGroup -->
        <text class="section-title mt-6">LynxTransitionGroup</text>
        <view class="btn" (bindtap)="addItem()">
          <text class="btn-text">+ Add Item</text>
        </view>
        <view class="mt-3">
          <lynx-transition-group
            [each]="items()"
            [trackBy]="trackById"
            name="list"
            [duration]="300"
          >
            <ng-template let-item>
              <view class="list-item">
                <text class="list-item-text">{{ item.label }}</text>
                <view class="remove-btn" (bindtap)="removeItem(item)">
                  <text class="remove-btn-text">×</text>
                </view>
              </view>
            </ng-template>
          </lynx-transition-group>
        </view>
      </view>
    </app-demo-screen>
  `,
})
export class TransitionDemo {
  readonly showPanel = signal(false);
  readonly items = signal<Item[]>([
    { id: 1, label: 'Item 1' },
    { id: 2, label: 'Item 2' },
    { id: 3, label: 'Item 3' },
  ]);
  #nextId = 4;

  readonly trackById = (item: Item) => item.id;

  /**
   * All three methods defer signal updates via setTimeout to avoid updating signals
   * synchronously inside a Lynx native event handler (bindtap). Updating directly
   * inside the handler can cause the renderer to flush while the native event is
   * still on the call stack, which breaks Lynx's main-thread frame pipeline.
   */
  togglePanel(): void {
    setTimeout(() => this.showPanel.update((v) => !v), 0);
  }

  addItem(): void {
    setTimeout(() => {
      const id = this.#nextId++;
      this.items.update((items) => [...items, { id, label: `Item ${id}` }]);
    }, 0);
  }

  removeItem(item: Item): void {
    setTimeout(() => {
      this.items.update((items) => items.filter((i) => i.id !== item.id));
    }, 0);
  }
}

import { Component, signal } from '@angular/core';
import {
  LYNX_ELEMENTS,
  LynxTransition,
  LynxTransitionGroup,
} from '@blotch/angular-lynx';

type Item = { id: number; label: string };

@Component({
  selector: 'app-root',
  template: `
    <view style="padding: 24px;">
      <text style="font-size: 20px; font-weight: bold; margin-bottom: 24px;">
        Transition Demo
      </text>

      <!-- ── LynxTransition: single element ── -->
      <text style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">
        LynxTransition — Single Element
      </text>
      <view class="btn" (bindtap)="togglePanel()">
        <text class="btn-text">{{
          showPanel() ? 'Hide Panel' : 'Show Panel'
        }}</text>
      </view>
      <lynx-transition [show]="showPanel()" name="fade" [duration]="300">
        <view class="panel">
          <text class="panel-text">I fade and slide in/out!</text>
        </view>
      </lynx-transition>

      <!-- ── LynxTransitionGroup: dynamic list ── -->
      <text
        style="font-size: 14px; font-weight: bold; margin-top: 32px; margin-bottom: 8px;"
      >
        LynxTransitionGroup — Dynamic List
      </text>
      <view class="btn" (bindtap)="addItem()">
        <text class="btn-text">+ Add Item</text>
      </view>
      <view style="margin-top: 12px;">
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
  `,
  styles: [
    `
      .btn {
        background-color: #6200ee;
        border-radius: 8px;
        padding: 10px 20px;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;
      }
      .btn-text {
        color: white;
        font-size: 14px;
        font-weight: bold;
      }

      .panel {
        background-color: #e8d5ff;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 8px;
      }
      .panel-text {
        color: #6200ee;
        font-size: 14px;
      }

      /* LynxTransition fade + slide animation */
      .fade-enter-active,
      .fade-leave-active {
        transition:
          opacity 300ms ease,
          transform 300ms ease;
      }
      .fade-enter-from {
        opacity: 0;
        transform: translateY(-16px);
      }
      .fade-leave-to {
        opacity: 0;
        transform: translateY(-16px);
      }

      .list-item {
        background-color: #03dac6;
        border-radius: 8px;
        padding: 12px 16px;
        margin-bottom: 8px;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
      .list-item-text {
        color: white;
        font-size: 14px;
        font-weight: bold;
        flex: 1;
      }
      .remove-btn {
        background-color: rgba(0, 0, 0, 0.2);
        border-radius: 16px;
        width: 28px;
        height: 28px;
        align-items: center;
        justify-content: center;
      }
      .remove-btn-text {
        color: white;
        font-size: 16px;
        font-weight: bold;
      }

      /* LynxTransitionGroup slide animation */
      .list-enter-active,
      .list-leave-active {
        transition:
          opacity 300ms ease,
          transform 300ms ease;
      }
      .list-enter-from {
        opacity: 0;
        transform: translateX(30px);
      }
      .list-leave-to {
        opacity: 0;
        transform: translateX(-30px);
      }
    `,
  ],
  imports: [LYNX_ELEMENTS, LynxTransition, LynxTransitionGroup],
})
export class App {
  readonly showPanel = signal(false);
  readonly items = signal<Item[]>([
    { id: 1, label: 'Item 1' },
    { id: 2, label: 'Item 2' },
    { id: 3, label: 'Item 3' },
  ]);
  #nextId = 4;

  readonly trackById = (item: Item) => item.id;

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

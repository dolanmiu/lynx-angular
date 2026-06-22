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
    <scroll-view class="page" scroll-orientation="vertical">
      <view class="container">
        <text class="title">Transitions</text>
        <text class="subtitle"
          >Animate elements entering and leaving the DOM.</text
        >

        <view class="card">
          <text class="section-label">LynxTransition — Single Element</text>
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
        </view>

        <view class="card">
          <text class="section-label">LynxTransitionGroup — Dynamic List</text>
          <view class="btn" (bindtap)="addItem()">
            <text class="btn-text">+ Add Item</text>
          </view>
          <view class="list-area">
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
      </view>
    </scroll-view>
  `,
  styles: [
    `
      .page {
        height: 100%;
        background-color: #fafafa;
      }
      .container {
        padding: 24px;
      }
      .title {
        font-size: 28px;
        font-weight: bold;
        color: #18181b;
        margin-bottom: 4px;
      }
      .subtitle {
        font-size: 13px;
        color: #71717a;
        margin-bottom: 20px;
      }
      .card {
        background-color: #ffffff;
        border: 1px solid #e4e4e7;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 16px;
      }
      .section-label {
        font-size: 11px;
        font-weight: 700;
        color: #a1a1aa;
        margin-bottom: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .btn {
        background-color: #6366f1;
        border-radius: 8px;
        padding: 10px 20px;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;
      }
      .btn-text {
        color: white;
        font-size: 14px;
        font-weight: 600;
      }

      .panel {
        background-color: #eef2ff;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 8px;
      }
      .panel-text {
        color: #4338ca;
        font-size: 14px;
      }

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

      .list-area {
        margin-top: 4px;
      }
      .list-item {
        background-color: #6366f1;
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
        font-weight: 600;
        flex: 1;
      }
      .remove-btn {
        background-color: rgba(0, 0, 0, 0.15);
        border-radius: 14px;
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

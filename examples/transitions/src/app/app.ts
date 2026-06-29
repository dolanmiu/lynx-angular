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
    <scroll-view class="h-full bg-zinc-50" scroll-orientation="vertical">
      <view class="p-6">
        <text class="text-[28px] font-bold text-zinc-900 mb-1"
          >Transitions</text
        >
        <text class="text-[13px] text-zinc-500 mb-5"
          >Animate elements entering and leaving the DOM.</text
        >

        <view class="bg-white border border-zinc-200 rounded-xl p-4 mb-4">
          <text
            class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-3"
            >LynxTransition — Single Element</text
          >
          <view
            class="bg-indigo-500 rounded-lg py-2.5 px-5 items-center justify-center mb-3"
            (bindtap)="togglePanel()"
          >
            <text class="text-white text-sm font-semibold">{{
              showPanel() ? 'Hide Panel' : 'Show Panel'
            }}</text>
          </view>
          <lynx-transition [show]="showPanel()" name="fade" [duration]="300">
            <view class="bg-indigo-50 rounded-lg p-4 mb-2">
              <text class="text-sm text-indigo-700"
                >I fade and slide in/out!</text
              >
            </view>
          </lynx-transition>
        </view>

        <view class="bg-white border border-zinc-200 rounded-xl p-4 mb-4">
          <text
            class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-3"
            >LynxTransitionGroup — Dynamic List</text
          >
          <view
            class="bg-indigo-500 rounded-lg py-2.5 px-5 items-center justify-center mb-3"
            (bindtap)="addItem()"
          >
            <text class="text-white text-sm font-semibold">+ Add Item</text>
          </view>
          <view class="mt-1">
            <lynx-transition-group
              [each]="items()"
              [trackBy]="trackById"
              name="list"
              [duration]="300"
            >
              <ng-template let-item>
                <view
                  class="bg-indigo-500 rounded-lg px-4 py-3 mb-2 flex-row justify-between items-center"
                >
                  <text class="text-sm font-semibold text-white flex-1">{{
                    item.label
                  }}</text>
                  <view
                    class="w-7 h-7 rounded-[14px] items-center justify-center"
                    style="background-color: rgba(0,0,0,0.15)"
                    (bindtap)="removeItem(item)"
                  >
                    <text class="text-white text-base font-bold">×</text>
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

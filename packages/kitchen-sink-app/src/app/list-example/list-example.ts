import { Component, signal } from '@angular/core';

import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-list-example',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  template: `
    <scroll-view
      class="h-screen flex-col bg-gray-100 p-4 flex"
      scroll-orientation="vertical"
    >
      <text class="mb-4 text-[24px] font-bold text-center">List Example</text>
      <!-- Simple list example -->
      <view class="flex justify-center">
        <view
          class="rounded-lg bg-blue-500 px-6 py-3"
          (bindtap)="toggleItems()"
        >
          <text class="text-base text-white text-center"
            >Toggle Items ({{ showItems() }})</text
          >
        </view>
        <view class="rounded-lg bg-blue-500 px-6 py-3" (bindtap)="addItem()">
          <text class="text-base text-white text-center">Add Item</text>
        </view>
      </view>
      <text class="text-[10px] text-gray-800">{{ dbg }}</text>
      <list
        class="mb-4 h-[400px] w-full rounded-lg bg-red-500 overflow-hidden"
        list-type="single"
        [span-count]="1"
        scroll-orientation="vertical"
      >
        <!-- @if (showItems()) {
          @for (item of items(); track item.id) {
          <list-item class="p-4 border-b border-gray-300" item-key="{{ item.id }}">
            <text class="text-base bg-blue-500 text-black">{{ item.text }}</text>
          </list-item>
          }
        } -->
        <!-- <list-item class="p-4 border-b border-gray-300" item-key="1">
          <text class="text-base bg-blue-500 text-black">Test 1</text>
        </list-item>
        <list-item class="p-4 border-b border-gray-300" item-key="2">
          <text class="text-base bg-blue-500 text-black">Test 2</text>
        </list-item>
        <list-item class="p-4 border-b border-gray-300" item-key="3">
          <text class="text-base bg-blue-500 text-black">Test 3</text>
        </list-item> -->
      </list>
    </scroll-view>
  `,
})
export class ListExample {
  showItems = signal(false);
  items = signal([
    { id: 1, text: 'Item 1' },
    { id: 2, text: 'Item 2' },
    { id: 3, text: 'Item 3' },
  ]);

  nextId = signal(4);

  /**
   * On-device debug output — Lynx has no browser console, so debug state
   * is rendered to screen via a <text> element. The runtime or native layer
   * can write to `globalThis.__dbg` and it surfaces here immediately.
   */
  get dbg(): string {
    return (globalThis as any).__dbg || 'none';
  }

  toggleItems() {
    this.showItems.update((v) => !v);
  }

  addItem() {
    const id = this.nextId();
    this.items.update((items) => [...items, { id, text: `Item ${id}` }]);
    this.nextId.update((v) => v + 1);
  }
}

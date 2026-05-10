import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-list-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <x-scroll-view class="list-container" scroll-orientation="vertical">
      <x-text class="title">List Example</x-text>
      <!-- Simple list example -->
      <x-view class="button-container">
        <x-view class="button" (bindtap)="toggleItems()">
          <x-text class="button-text">Toggle Items ({{ showItems() }})</x-text>
        </x-view>
        <x-view class="button" (bindtap)="addItem()">
          <x-text class="button-text">Add Item</x-text>
        </x-view>
      </x-view>
      <x-text style="font-size: 10px; color: #333; white-space: pre-wrap">{{ dbg }}</x-text>
      <x-list class="list" list-type="single" span-count="1" scroll-orientation="vertical">
        <!-- @if (showItems()) {
          @for (item of items(); track item.id) {
          <list-item class="list-item" item-key="{{ item.id }}">
            <x-text class="item-text">{{ item.text }}</x-text>
          </list-item>
          }
        } -->
        <!-- <list-item class="list-item" item-key="1">
          <x-text class="item-text">Test 1</x-text>
        </list-item>
        <list-item class="list-item" item-key="2">
          <x-text class="item-text">Test 2</x-text>
        </list-item>
        <list-item class="list-item" item-key="3">
          <x-text class="item-text">Test 3</x-text>
        </list-item> -->
      </x-list>


    </x-scroll-view>
  `,
  styles: [
    `
      .list-container {
        display: flex;
        flex-direction: column;
        padding: 16px;
        height: 100vh;
        background-color: #f5f5f5;
      }

      .title {
        font-size: 24px;
        margin-bottom: 16px;
        text-align: center;
        font-weight: bold;
      }

      .list {
        width: 100%;
        height: 400px;
        background-color: red;
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 16px;
      }

      .list-item {
        padding: 16px;
        border-bottom: 1px solid #e0e0e0;
      }

      .item-text {
        font-size: 16px;
        background-color: #007bff;
        color: black;
      }

      .button-container {
        display: flex;
        justify-content: center;
      }

      .button {
        background-color: #007bff;
        border-radius: 8px;
        padding: 12px 24px;
      }

      .button-text {
        color: white;
        font-size: 16px;
        text-align: center;
      }
    `,
  ],
})
export class ListExampleComponent {
  showItems = signal(false);
  items = signal([
    { id: 1, text: 'Item 1' },
    { id: 2, text: 'Item 2' },
    { id: 3, text: 'Item 3' },
  ]);

  nextId = signal(4);

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

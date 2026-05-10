import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-list-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <scroll-view class="list-container" scroll-orientation="vertical">
      <text class="title">List Example</text>
      <!-- Simple list example -->
      <view class="button-container">
        <view class="button" (bindtap)="toggleItems()">
          <text class="button-text">Toggle Items ({{ showItems() }})</text>
        </view>
        <view class="button" (bindtap)="addItem()">
          <text class="button-text">Add Item</text>
        </view>
      </view>
      <text style="font-size: 10px; color: #333; white-space: pre-wrap">{{ dbg }}</text>
      <list class="list" list-type="single" span-count="1" scroll-orientation="vertical">
        <!-- @if (showItems()) {
          @for (item of items(); track item.id) {
          <list-item class="list-item" item-key="{{ item.id }}">
            <text class="item-text">{{ item.text }}</text>
          </list-item>
          }
        } -->
        <!-- <list-item class="list-item" item-key="1">
          <text class="item-text">Test 1</text>
        </list-item>
        <list-item class="list-item" item-key="2">
          <text class="item-text">Test 2</text>
        </list-item>
        <list-item class="list-item" item-key="3">
          <text class="item-text">Test 3</text>
        </list-item> -->
      </list>


    </scroll-view>
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

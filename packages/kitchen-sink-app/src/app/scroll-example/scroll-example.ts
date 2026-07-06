import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-scroll-example',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  template: `
    <view class="h-screen flex-col bg-gray-100 p-4 flex">
      <text class="mb-4 text-[24px] font-bold text-center"
        >Scroll View Example</text
      >
      <!-- Horizontal scroll example -->
      <text class="my-3 text-[18px] font-bold">Horizontal Scroll</text>
      <scroll-view
        class="mb-6 h-[120px] rounded-lg bg-white"
        scroll-orientation="horizontal"
      >
        @for (item of horizontalItems; track item) {
          <view
            class="m-4 h-[80px] w-[150px] items-center rounded-lg bg-blue-500 flex justify-center"
          >
            <text class="text-base font-bold text-white">{{ item }}</text>
          </view>
        }
      </scroll-view>
      <!-- Vertical scroll example -->
      <text class="my-3 text-[18px] font-bold">Vertical Scroll</text>
      <scroll-view
        class="flex-1 rounded-lg bg-white"
        scroll-orientation="vertical"
      >
        @for (item of verticalItems; track item) {
          <view
            class="m-4 h-[80px] items-center rounded-lg bg-[#17a2b8] flex justify-center"
          >
            <text class="text-base font-bold text-white">{{ item }}</text>
          </view>
        }
      </scroll-view>
    </view>
  `,
})
export class ScrollExample {
  horizontalItems = [
    'Horizontal 1',
    'Horizontal 2',
    'Horizontal 3',
    'Horizontal 4',
    'Horizontal 5',
    'Horizontal 6',
    'Horizontal 7',
    'Horizontal 8',
  ];

  verticalItems = [
    'Vertical 1',
    'Vertical 2',
    'Vertical 3',
    'Vertical 4',
    'Vertical 5',
    'Vertical 6',
    'Vertical 7',
    'Vertical 8',
    'Vertical 9',
    'Vertical 10',
  ];
}

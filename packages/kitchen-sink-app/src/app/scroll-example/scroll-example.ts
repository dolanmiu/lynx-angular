import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-scroll-example',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  template: `
    <view class="flex flex-col p-4 h-screen bg-gray-100">
      <text class="text-[24px] mb-4 text-center font-bold"
        >Scroll View Example</text
      >
      <!-- Horizontal scroll example -->
      <text class="text-[18px] my-3 font-bold">Horizontal Scroll</text>
      <scroll-view
        class="h-[120px] bg-white rounded-lg mb-6"
        scroll-orientation="horizontal"
      >
        @for (item of horizontalItems; track item) {
          <view
            class="w-[150px] h-[80px] bg-blue-500 rounded-lg m-4 flex justify-center items-center"
          >
            <text class="text-white text-base font-bold">{{ item }}</text>
          </view>
        }
      </scroll-view>
      <!-- Vertical scroll example -->
      <text class="text-[18px] my-3 font-bold">Vertical Scroll</text>
      <scroll-view
        class="flex-1 bg-white rounded-lg"
        scroll-orientation="vertical"
      >
        @for (item of verticalItems; track item) {
          <view
            class="h-[80px] bg-[#17a2b8] rounded-lg m-4 flex justify-center items-center"
          >
            <text class="text-white text-base font-bold">{{ item }}</text>
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

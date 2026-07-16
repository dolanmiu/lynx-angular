import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { UiBadge } from '../../components/ui/badge';
import { UiText } from '../../components/ui/typography';
import { ScreenHost } from '../screen-host';

@Component({
  selector: 'app-scroll-example',
  hostDirectives: [ScreenHost],
  standalone: true,
  imports: [LYNX_ELEMENTS, UiText, UiBadge],
  template: `
    <view class="h-full flex-col bg-gray-100 p-4 flex">
      <view class="flex-col gap-2 p-4 flex">
        <ui-text variant="h3">Scroll View</ui-text>
        <ui-badge variant="secondary">Elements</ui-badge>
      </view>
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
      <!-- Vertical scroll example. The scroll-view is wrapped in a flex-1
           column view because in Lynx flex-1 on the scroll-view itself does NOT
           bound it (it expands to content); the flex-1 must live on a plain view
           that is the real flex child, and the scroll-view then fills it with
           h-full w-full. See investigations/lynx-vs-web-differences.md. -->
      <text class="my-3 text-[18px] font-bold">Vertical Scroll</text>
      <view class="flex-1 flex-col flex">
        <scroll-view
          class="h-full w-full rounded-lg bg-white"
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

import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import angularLogo from '../../assets/angular-logo.png';
import lynxLogo from '../../assets/lynx-logo.png';
import { UiBadge } from '../../components/ui/badge';
import { UiText } from '../../components/ui/typography';
import { ScreenHost } from '../screen-host';

@Component({
  selector: 'app-elements-showcase',
  hostDirectives: [ScreenHost],
  standalone: true,
  imports: [LYNX_ELEMENTS, UiText, UiBadge],
  template: `
    <scroll-view scroll-orientation="vertical" class="h-full w-full bg-gray-100 p-4">
      <view class="flex-col gap-2 p-4 flex">
        <ui-text variant="h3">Elements Showcase</ui-text>
        <ui-badge variant="secondary">Elements</ui-badge>
      </view>

      <!-- Basic Elements Section -->
      <!-- <view class="mb-8">
        <text class="text-xl font-bold mb-4 text-gray-600">Basic Elements</text>

        <view class="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <text class="text-base font-bold mb-2 text-blue-500">view</text>
          <view class="bg-gray-50 rounded p-4 my-2 min-h-[60px]">
            <view class="w-[60px] h-[60px] bg-blue-500 rounded"></view>
          </view>
          <text class="text-sm text-gray-500"
            >Basic container element, similar to a div</text
          >
        </view>

        <view class="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <text class="text-base font-bold mb-2 text-blue-500">text</text>
          <view class="bg-gray-50 rounded p-4 my-2 min-h-[60px]">
            <text class="text-[18px] font-bold text-green-500">Hello, World!</text>
          </view>
          <text class="text-sm text-gray-500"
            >Text element for displaying content</text
          >
        </view>

        <view class="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <text class="text-base font-bold mb-2 text-blue-500">image</text>
          <view class="bg-gray-50 rounded p-4 my-2 min-h-[60px]">
            <image [src]="images.lynx" class="w-[60px] h-[60px]"></image>
          </view>
          <text class="text-sm text-gray-500"
            >Image element for displaying images</text
          >
        </view>
      </view> -->

      <!-- Layout Elements Section -->
      <view class="mb-8">
        <text class="mb-4 text-xl font-bold text-gray-600"
          >Layout Elements</text
        >

        <!-- <view class="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <text class="text-base font-bold mb-2 text-blue-500">scroll-view</text>
          <view class="bg-gray-50 rounded p-4 my-2 min-h-[60px]">
            <scroll-view class="h-[60px]" scroll-orientation="horizontal">
              <view class="flex flex-row">
                @for (i of [1, 2, 3, 4, 5]; track i) {
                <view class="min-w-[80px] h-[40px] mr-2 bg-blue-500 rounded flex justify-center items-center">
                  <text class="text-white">Item {{ i }}</text>
                </view>
                }
              </view>
            </scroll-view>
          </view>
          <text class="text-sm text-gray-500">Scrollable container for content</text>
        </view> -->

        <view class="mb-4 rounded-lg bg-white p-4 shadow-sm">
          <text class="mb-2 text-base font-bold text-blue-500">list</text>
          <view class="my-2 min-h-[60px] rounded bg-gray-50 p-4">
            <list class="h-[120px] w-full">
              @for (i of [1, 2, 3]; track i) {
                <list-item
                  class="border-b border-gray-200 p-2"
                  item-key="{{ i }}"
                >
                  <text>List Item {{ i }}</text>
                </list-item>
              }
            </list>
          </view>
          <text class="text-sm text-gray-500"
            >Optimized container for list items</text
          >
        </view>
      </view>

      <!-- Structural Elements -->
      <!-- <view class="mb-8">
        <text class="text-xl font-bold mb-4 text-gray-600">Structural Elements</text>

        <view class="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <text class="text-base font-bold mb-2 text-blue-500">view (grouping)</text>
          <view class="bg-gray-50 rounded p-4 my-2 min-h-[60px]">
            <view class="flex flex-row">
              <view class="w-[40px] h-[40px] bg-red-500 mr-2 rounded"></view>
              <view class="w-[40px] h-[40px] bg-red-500 mr-2 rounded"></view>
            </view>
          </view>
          <text class="text-sm text-gray-500">Using view as a container for grouping elements</text>
        </view>

        <view class="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <text class="text-base font-bold mb-2 text-blue-500">Conditional Rendering</text>
          <view class="bg-gray-50 rounded p-4 my-2 min-h-[60px]">
            <view class="bg-cyan-500 px-4 py-2 rounded mb-2 self-start" (bindtap)="toggleVisibility()">
              <text class="text-white">Toggle</text>
            </view>

            @if (isVisible()) {
            <view class="bg-yellow-400 p-2 rounded">
              <text>I'm visible!</text>
            </view>
            }
          </view>
          <text class="text-sm text-gray-500"
            >Using Angular's if control flow for conditionals</text
          >
        </view>

        <view class="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <text class="text-base font-bold mb-2 text-blue-500">List Rendering</text>
          <view class="bg-gray-50 rounded p-4 my-2 min-h-[60px]">
            <view class="bg-gray-50 rounded p-2">
              @for (item of listItems; track item; let i = $index) {
              <view class="py-1">
                <text>{{ i + 1 }}. {{ item }}</text>
              </view>
              }
            </view>
          </view>
          <text class="text-sm text-gray-500"
            >Using Angular's for control flow for lists</text
          >
        </view>
      </view> -->

      <!-- Events Demo -->
      <view class="mb-8">
        <text class="mb-4 text-xl font-bold text-gray-600">Event Handling</text>

        <view class="mb-4 rounded-lg bg-white p-4 shadow-sm">
          <text class="mb-2 text-base font-bold text-blue-500">Tap Event</text>
          <view class="my-2 min-h-[60px] rounded bg-gray-50 p-4">
            <view
              class="mb-2 self-start rounded bg-green-500 px-4 py-2"
              (bindtap)="handleTap()"
            >
              <text class="text-white">Tap Me</text>
            </view>
            <text class="mt-2 font-bold">Taps: {{ tapCount() }}</text>
          </view>
          <text class="text-sm text-gray-500">Using bindtap event handler</text>
        </view>
      </view>
    </scroll-view>
  `,
})
export class ElementsShowcase {
  images = {
    lynx: lynxLogo,
    angular: angularLogo,
  };

  isVisible = signal(true);

  tapCount = signal(0);

  listItems = ['Apple', 'Banana', 'Cherry'];

  toggleVisibility(): void {
    this.isVisible.update((v) => !v);
  }

  handleTap(): void {
    this.tapCount.update((v) => v + 1);
  }
}

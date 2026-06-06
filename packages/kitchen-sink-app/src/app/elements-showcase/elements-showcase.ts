import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import angularLogo from '../../assets/angular-logo.png';
import lynxLogo from '../../assets/lynx-logo.png';

@Component({
  selector: 'app-elements-showcase',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  template: `
    <view class="container">
      <text class="title">Lynx Elements Showcase</text>

      <!-- Basic Elements Section -->
      <!-- <view class="section">
        <text class="section-title">Basic Elements</text>

        <view class="card">
          <text class="element-name">view</text>
          <view class="element-example">
            <view class="colored-box"></view>
          </view>
          <text class="description"
            >Basic container element, similar to a div</text
          >
        </view>

        <view class="card">
          <text class="element-name">text</text>
          <view class="element-example">
            <text class="styled-text">Hello, World!</text>
          </view>
          <text class="description"
            >Text element for displaying content</text
          >
        </view>

        <view class="card">
          <text class="element-name">image</text>
          <view class="element-example">
            <image [src]="images.lynx" class="logo-image"></image>
          </view>
          <text class="description"
            >Image element for displaying images</text
          >
        </view>
      </view> -->

      <!-- Layout Elements Section -->
      <view class="section">
        <text class="section-title">Layout Elements</text>

        <!-- <view class="card">
          <text class="element-name">scroll-view</text>
          <view class="element-example">
            <scroll-view class="mini-scroll" scroll-orientation="horizontal">
              <view class="scroll-content">
                @for (i of [1, 2, 3, 4, 5]; track i) {
                <view class="scroll-item">
                  <text>Item {{ i }}</text>
                </view>
                }
              </view>
            </scroll-view>
          </view>
          <text class="description">Scrollable container for content</text>
        </view> -->

        <view class="card">
          <text class="element-name">list</text>
          <view class="element-example">
            <list class="mini-list">
              @for (i of [1, 2, 3]; track i) {
                <list-item class="list-item" item-key="{{ i }}">
                  <text>List Item {{ i }}</text>
                </list-item>
              }
            </list>
          </view>
          <text class="description">Optimized container for list items</text>
        </view>
      </view>

      <!-- Structural Elements -->
      <!-- <view class="section">
        <text class="section-title">Structural Elements</text>

        <view class="card">
          <text class="element-name">view (grouping)</text>
          <view class="element-example">
            <view class="block-example">
              <view class="block-item"></view>
              <view class="block-item"></view>
            </view>
          </view>
          <text class="description">Using view as a container for grouping elements</text>
        </view>

        <view class="card">
          <text class="element-name">Conditional Rendering</text>
          <view class="element-example">
            <view class="toggle-container" (bindtap)="toggleVisibility()">
              <text>Toggle</text>
            </view>

            @if (isVisible) {
            <view class="conditional-element">
              <text>I'm visible!</text>
            </view>
            }
          </view>
          <text class="description"
            >Using Angular's if control flow for conditionals</text
          >
        </view>

        <view class="card">
          <text class="element-name">List Rendering</text>
          <view class="element-example">
            <view class="list-render-example">
              @for (item of listItems; track item; let i = $index) {
              <view class="list-render-item">
                <text>{{ i + 1 }}. {{ item }}</text>
              </view>
              }
            </view>
          </view>
          <text class="description"
            >Using Angular's for control flow for lists</text
          >
        </view>
      </view> -->

      <!-- Events Demo -->
      <view class="section">
        <text class="section-title">Event Handling</text>

        <view class="card">
          <text class="element-name">Tap Event</text>
          <view class="element-example">
            <view class="event-button" (bindtap)="handleTap()">
              <text>Tap Me</text>
            </view>
            <text class="tap-count">Taps: {{ tapCount() }}</text>
          </view>
          <text class="description">Using bindtap event handler</text>
        </view>
      </view>
    </view>
  `,
  styles: [
    `
      .container {
        padding: 16px;
        background-color: #f5f5f5;
        min-height: 100vh;
      }

      .title {
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        margin-bottom: 24px;
      }

      .section {
        margin-bottom: 32px;
      }

      .section-title {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 16px;
        color: #444;
      }

      .card {
        background-color: white;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .element-name {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 8px;
        color: #007bff;
      }

      .element-example {
        background-color: #f9f9f9;
        border-radius: 4px;
        padding: 16px;
        margin: 8px 0;
        min-height: 60px;
      }

      .description {
        font-size: 14px;
        color: #666;
      }

      .colored-box {
        width: 60px;
        height: 60px;
        background-color: #007bff;
        border-radius: 4px;
      }

      .styled-text {
        font-size: 18px;
        font-weight: bold;
        color: #28a745;
      }

      .logo-image {
        width: 60px;
        height: 60px;
      }

      .mini-scroll {
        height: 60px;
      }

      .scroll-content {
        display: flex;
        flex-direction: row;
      }

      .scroll-item {
        min-width: 80px;
        height: 40px;
        margin-right: 8px;
        background-color: #007bff;
        border-radius: 4px;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .scroll-item text {
        color: white;
      }

      .mini-list {
        width: 100%;
        height: 120px;
      }

      .list-item {
        padding: 8px;
        border-bottom: 1px solid #eee;
      }

      .block-example {
        display: flex;
        flex-direction: row;
      }

      .block-item {
        width: 40px;
        height: 40px;
        background-color: #dc3545;
        margin-right: 8px;
        border-radius: 4px;
      }

      .toggle-container {
        background-color: #17a2b8;
        padding: 8px 16px;
        border-radius: 4px;
        margin-bottom: 8px;
        align-self: flex-start;
      }

      .toggle-container text {
        color: white;
      }

      .conditional-element {
        background-color: #ffc107;
        padding: 8px;
        border-radius: 4px;
      }

      .list-render-example {
        background-color: #f8f9fa;
        border-radius: 4px;
        padding: 8px;
      }

      .list-render-item {
        padding: 4px 0;
      }

      .event-button {
        background-color: #28a745;
        padding: 8px 16px;
        border-radius: 4px;
        margin-bottom: 8px;
        align-self: flex-start;
      }

      .event-button text {
        color: white;
      }

      .tap-count {
        margin-top: 8px;
        font-weight: bold;
      }
    `,
  ],
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

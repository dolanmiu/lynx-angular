import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LYNX_ELEMENTS, LynxLogger } from '@blotch/angular-lynx';
import type { TouchEvent } from '@lynx-js/types';
import angularLogo from '../assets/angular-logo.png';
import arrow from '../assets/arrow.png';
import lynxLogo from '../assets/lynx-logo.png';

@Component({
  selector: 'app-root',
  template: `
    <!-- background is a sibling of the scroll-view at the page level, NOT inside it.
         position: fixed/absolute elements inside a scroll-view intercept the platform
         scroll gesture recognizer even with pointer-events: none. As a sibling that
         comes first in DOM order, it has lower stacking context and the scroll-view
         (rendered after) sits on top and receives all platform gestures. -->
    <view class="background" />
    <scroll-view class="app-container" scroll-orientation="vertical">
      <view class="app">
        <view class="banner">
          <view class="logo" (bindtap)="onTap($event)">
            @if (alterLogo()) {
              <image [src]="angularLogo" class="logo--angular" />
            } @else {
              <image [src]="lynxLogo" class="logo--lynx" />
            }
          </view>
          <text class="title">Angular</text>
          <text class="subtitle">on Lynx</text>
        </view>
        <input
          placeholder="Enter text"
          type="text"
          (bindinput)="onInput($any($event))"
        />
        <textarea
          placeholder="Enter multi-line text"
          (bindinput)="onInput($any($event))"
        ></textarea>
        <view class="content">
          <image [src]="arrow" class="arrow" />
          <text class="description">Tap the logo and have fun!</text>
          <text class="hint">
            Edit<text style="font-style: italic"> src/app/app.ts</text>
          </text>
        </view>

        <view style="height: 300px; overflow: hidden;">
          <router-outlet />
        </view>

        <overlay
          [attr.visible]="showOverlay()"
          style="position: fixed; overflow: visible;"
        >
          <view
            style="width: 100%; height: 100%; z-index: 0; justify-content: center; align-items: center; background-color: rgba(0,0,0,0.5);"
            (bindtap)="closeOverlay()"
          >
            <view
              style="background-color: white; padding: 24px; border-radius: 12px; width: 80%;"
            >
              <text
                style="font-size: 18px; font-weight: bold; margin-bottom: 12px;"
                >Overlay Demo</text
              >
              <text style="font-size: 14px; margin-bottom: 16px;"
                >This modal is rendered outside the Lynx document flow using the
                native overlay element.</text
              >
              <view
                style="background-color: #6200ee; padding: 12px; border-radius: 8px; align-items: center;"
                (catchtap)="closeOverlay()"
              >
                <text style="color: white; font-size: 14px;">Close</text>
              </view>
            </view>
          </view>
        </overlay>

        <!-- <svg [attr.content]="svgContent" style="width: 80px; height: 80px; margin: 16px 0;" /> -->

        <!-- frame element: set src to a .lynx.bundle URL to embed a nested Lynx page -->
        <frame
          style="width: 100%; height: 200px; border: 2px solid #6200ee; margin: 8px 0;"
          (bindload)="onFrameLoad($any($event))"
        ></frame>

        <view
          class="nav-button"
          style="margin-bottom: 12px; background-color: #6200ee;"
          (bindtap)="openOverlay()"
        >
          <text class="nav-button-text" style="color: white;"
            >Open Overlay</text
          >
        </view>

        <view class="navigation">
          <text class="nav-title">Examples:</text>
          <view class="nav-links">
            <view class="nav-button" (bindtap)="navigateTo('showcase')">
              <text class="nav-button-text">Elements Showcase</text>
            </view>
            <view class="nav-button" (bindtap)="navigateTo('list-example')">
              <text class="nav-button-text">List Example</text>
            </view>
            <view class="nav-button" (bindtap)="navigateTo('scroll-example')">
              <text class="nav-button-text">Scroll Example</text>
            </view>
            <view
              class="nav-button"
              (bindtap)="navigateTo('query-selector-demo')"
            >
              <text class="nav-button-text">querySelector Demo</text>
            </view>
            <view class="nav-button" (bindtap)="navigateTo('tailwind-demo')">
              <text class="nav-button-text">Tailwind Demo</text>
            </view>
            <view class="nav-button" (bindtap)="navigateTo('motion-demo')">
              <text class="nav-button-text">Motion Demo</text>
            </view>
            <view
              class="nav-button"
              (bindtap)="navigateTo('overlay-motion-demo')"
            >
              <text class="nav-button-text">Overlay + Motion</text>
            </view>
            <view class="nav-button" (bindtap)="navigateTo('css-modules-demo')">
              <text class="nav-button-text">CSS Modules</text>
            </view>
            <view class="nav-button" (bindtap)="navigateTo('defer-demo')">
              <text class="nav-button-text">Defer Demo</text>
            </view>
            <view class="nav-button" (bindtap)="navigateTo('gesture-demo')">
              <text class="nav-button-text">Gesture Demo</text>
            </view>
            <view class="nav-button" (bindtap)="navigateTo('fonts-demo')">
              <text class="nav-button-text">Fonts Demo</text>
            </view>
            <view
              class="nav-button"
              (bindtap)="navigateTo('text-measure-demo')"
            >
              <text class="nav-button-text">Text Measure</text>
            </view>
            <view
              class="nav-button"
              (bindtap)="navigateTo('content-projection-demo')"
            >
              <text class="nav-button-text">Content Projection</text>
            </view>
            <view class="nav-button" (bindtap)="navigateTo('exposure-demo')">
              <text class="nav-button-text">Exposure Demo</text>
            </view>
            <view class="nav-button" (bindtap)="navigateTo('main-thread-demo')">
              <text class="nav-button-text">Main Thread Demo</text>
            </view>
            <view
              class="nav-button"
              (bindtap)="navigateTo('worklet-directive-demo')"
            >
              <text class="nav-button-text">Worklet Directive</text>
            </view>
            <view class="nav-button" (bindtap)="navigateTo('transition-demo')">
              <text class="nav-button-text">Transition Demo</text>
            </view>
            <view class="nav-button" (bindtap)="navigateTo('i18n-demo')">
              <text class="nav-button-text">i18n Demo</text>
            </view>
            <view class="nav-button" (bindtap)="navigateTo('forms-demo')">
              <text class="nav-button-text">Forms</text>
            </view>
            <view class="nav-button" (bindtap)="navigateTo('ssr-demo')">
              <text class="nav-button-text">SSR Demo</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  `,
  styleUrl: './app.css',
  imports: [RouterOutlet, LYNX_ELEMENTS],
})
export class App {
  #router = inject(Router);
  #logger = inject(LynxLogger);
  alterLogo = signal(false);
  showOverlay = signal(false);

  openOverlay(): void {
    setTimeout(() => this.showOverlay.set(true), 0);
  }

  closeOverlay(): void {
    setTimeout(() => this.showOverlay.set(false), 0);
  }

  onInput(event: { detail: { value: string } }) {
    this.#logger.log('input', event.detail.value);
  }

  onTap(event: TouchEvent) {
    this.#logger.log('tap', event);
    this.alterLogo.update((value) => !value);
  }

  navigateTo(path: string): void {
    // Defer navigation out of the Lynx worklet event callback.
    // Angular's Router processes navigation synchronously, triggering
    // __RemoveElement/__CreateView/__AppendElement during the worklet —
    // React Lynx avoids this by never mutating the tree inside event handlers.
    // Moving to setTimeout ensures mutations happen in a clean macrotask.
    setTimeout(() => {
      this.#router.navigateByUrl(path);
      this.#logger.log('navigated to', path);
    }, 0);
  }

  get arrow() {
    return arrow;
  }

  get lynxLogo() {
    return lynxLogo;
  }

  get angularLogo() {
    return angularLogo;
  }

  onFrameLoad(event: {
    detail: { url: string; statusCode: number; statusMessage: string };
  }) {
    this.#logger.log(
      'frame loaded',
      `${event.detail.url} (${event.detail.statusCode})`,
    );
  }

  // Simple star SVG to demonstrate the <svg> element
  svgContent = `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#6200ee"/>
        <stop offset="100%" stop-color="#03dac6"/>
      </linearGradient>
    </defs>
    <polygon points="40,8 50,30 74,30 54,46 62,70 40,56 18,70 26,46 6,30 30,30"
      fill="url(#starGrad)" stroke="white" stroke-width="1.5"/>
  </svg>`;
}

import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
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
    <x-view class="background" />
    <x-scroll-view class="app-container" scroll-orientation="vertical">
      <x-view class="app">
        <x-view class="banner">
          <x-view class="logo" (bindtap)="onTap($event)">
            @if (alterLogo()) {
              <x-image [src]="angularLogo" class="logo--angular" />
            } @else {
              <x-image [src]="lynxLogo" class="logo--lynx" />
            }
          </x-view>
          <x-text class="title">Angular</x-text>
          <x-text class="subtitle">on Lynx</x-text>
        </x-view>
        <x-view class="content">
          <x-image [src]="arrow" class="arrow" />
          <x-text class="description">Tap the logo and have fun!</x-text>
          <x-text class="hint">
            Edit<x-text style="font-style: italic">
              src/app/app.components.ts</x-text
            >
          </x-text>
        </x-view>

        <x-view style="height: 300px; overflow: hidden;">
          <router-outlet />
        </x-view>

        <x-view class="navigation">
          <x-text class="nav-title">Examples:</x-text>
          <x-view class="nav-links">
            <x-view class="nav-button" (bindtap)="navigateTo('showcase')">
              <x-text class="nav-button-text">Elements Showcase</x-text>
            </x-view>
            <x-view class="nav-button" (bindtap)="navigateTo('list-example')">
              <x-text class="nav-button-text">List Example</x-text>
            </x-view>
            <x-view class="nav-button" (bindtap)="navigateTo('scroll-example')">
              <x-text class="nav-button-text">Scroll Example</x-text>
            </x-view>
          </x-view>
        </x-view>

      </x-view>
    </x-scroll-view>
  `,
  styleUrl: './app.component.css',
  imports: [RouterOutlet],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent {
  #router = inject(Router);
  alterLogo = signal(false);

  onTap(event: TouchEvent) {
    console.log(event);
    this.alterLogo.update((value) => !value);
  }

  navigateTo(path: string): void {
    this.#router.navigateByUrl(path);
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
}

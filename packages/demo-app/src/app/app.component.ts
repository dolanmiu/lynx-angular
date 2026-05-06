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
    <x-view>
      <x-view class="background" />
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

        <x-text style="color: red; font-size: 12px">IMG SRC: {{ lynxLogo }}</x-text>
        <x-image [src]="lynxLogo" style="width: 100px; height: 100px" />
        <router-outlet />

        <x-view style="flex: 1"></x-view>
      </x-view>
    </x-view>
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

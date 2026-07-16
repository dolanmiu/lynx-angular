import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-heavy',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  template: `
    <view class="p-4 bg-green-50 rounded-lg border-2 border-green-500">
      <text class="text-base font-bold text-green-800 mb-2">Heavy Component Loaded!</text>
      <text class="text-[13px] text-green-700"
        >This component was loaded via @defer. It lives in a separate file so
        Angular generates a dynamic import() for it.</text
      >
    </view>
  `,
})
export class Heavy {}

import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-heavy',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  template: `
    <view
      style="background-color: #e8f5e9; padding: 16px; border-radius: 8px; margin-top: 8px;"
    >
      <text style="font-size: 16px; font-weight: bold; color: #2e7d32;">
        Deferred Component Loaded!
      </text>
    </view>
  `,
})
export class Heavy {}

import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import styles from './demo.module.css';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="h-full bg-zinc-50" scroll-orientation="vertical">
      <view class="p-6">
        <text class="text-[28px] font-bold text-zinc-900 mb-1"
          >CSS Modules</text
        >
        <text class="text-[13px] text-zinc-500 mb-5"
          >Scoped, hashed class names for style isolation.</text
        >

        <view [class]="styles['card']">
          <text [class]="styles['title']">Styled Card</text>
          <text class="text-[13px] text-zinc-500">
            This card uses hashed CSS Module classes.
          </text>
        </view>

        <view [class]="styles['highlight']">
          <text class="text-sm text-indigo-700">Highlighted Section</text>
        </view>

        <view class="bg-zinc-100 rounded-xl p-3.5 mt-4">
          <text
            class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-2"
            >Hashed class names</text
          >
          <text class="text-[11px] text-zinc-500 mb-0.5"
            >card → {{ styles['card'] }}</text
          >
          <text class="text-[11px] text-zinc-500 mb-0.5"
            >title → {{ styles['title'] }}</text
          >
        </view>
      </view>
    </scroll-view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  readonly styles = styles;
}

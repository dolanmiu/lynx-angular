import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import styles from './demo.module.css';

@Component({
  selector: 'app-css-modules-demo',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  template: `
    <view class="p-4">
      <text class="text-xl font-bold mb-4">CSS Modules Demo</text>

      <!-- Styled via CSS Modules hashed class names -->
      <view [class]="styles['card']">
        <text [class]="styles['title']">Card Title (CSS Module)</text>
        <text
          >This card is styled with a hashed class from demo.module.css</text
        >
      </view>

      <view [class]="styles['highlight']">
        <text>Highlighted section via CSS Modules</text>
      </view>

      <view [class]="styles['card']">
        <view [class]="styles['badge']">
          <text class="text-white text-xs">Badge</text>
        </view>
        <text>Card with a badge element</text>
      </view>

      <!-- Debug: show the raw hashed class names -->
      <view class="mt-6 p-3 bg-gray-100 rounded-lg">
        <text class="text-sm font-bold text-gray-500 mb-2"
          >Debug: Hashed Class Names</text
        >
        <text class="text-xs text-gray-400 font-[monospace] mb-1"
          >card → {{ styles['card'] }}</text
        >
        <text class="text-xs text-gray-400 font-[monospace] mb-1"
          >title → {{ styles['title'] }}</text
        >
        <text class="text-xs text-gray-400 font-[monospace] mb-1"
          >highlight → {{ styles['highlight'] }}</text
        >
        <text class="text-xs text-gray-400 font-[monospace] mb-1"
          >badge → {{ styles['badge'] }}</text
        >
      </view>
    </view>
  `,
})
export class CssModulesDemo {
  // Expose the CSS Modules map as a class field so the template can access
  // hashed class names via binding: [class]="styles['card']". The bundler
  // generates the hashed names at build time; at runtime `styles` is a plain
  // object mapping local names to their hashed counterparts.
  readonly styles = styles;
}

import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <view style="padding: 24px;">
      <text style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">
        List Element
      </text>

      <list
        list-type="single"
        scroll-orientation="vertical"
        style="height: 300px;"
      >
        @for (item of items(); track item.id) {
          <list-item [attr.item-key]="item.id">
            <view
              style="padding: 16px; border-bottom: 1px solid #f0f0f0; flex-direction: row; align-items: center;"
            >
              <view
                style="width: 36px; height: 36px; border-radius: 18px; background-color: #e8eaf6; align-items: center; justify-content: center; margin-right: 12px;"
              >
                <text style="font-size: 14px; color: #3f51b5;">
                  {{ item.id }}
                </text>
              </view>
              <text style="font-size: 16px;">{{ item.name }}</text>
            </view>
          </list-item>
        }
      </list>
    </view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class AppComponent {
  items = signal(
    Array.from({ length: 50 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Item ${i + 1}`,
    })),
  );
}

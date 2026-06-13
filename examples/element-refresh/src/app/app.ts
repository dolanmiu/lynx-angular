import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <refresh (bindstartrefresh)="onRefresh()">
      <refresh-header>
        <view style="height: 60px; align-items: center; justify-content: center;">
          <text style="font-size: 14px; color: #666;">
            {{ refreshing() ? 'Refreshing...' : 'Pull down to refresh' }}
          </text>
        </view>
      </refresh-header>
      <scroll-view scroll-orientation="vertical" style="height: 100vh;">
        <view style="padding: 16px;">
          <text style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">
            Refresh Example
          </text>
          @for (item of items(); track item.id) {
            <view
              style="padding: 16px; margin-bottom: 8px; background-color: #f5f5f5; border-radius: 8px;"
            >
              <text style="font-size: 16px;">{{ item.name }}</text>
              <text style="font-size: 12px; color: #999; margin-top: 4px;">
                Added {{ item.time }}
              </text>
            </view>
          }
        </view>
      </scroll-view>
    </refresh>
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  #counter = 0;

  refreshing = signal(false);
  items = signal(this.#generateItems());

  onRefresh(): void {
    this.refreshing.set(true);
    setTimeout(() => {
      this.items.set(this.#generateItems());
      this.refreshing.set(false);
    }, 1500);
  }

  #generateItems(): { id: number; name: string; time: string }[] {
    const now = new Date().toLocaleTimeString();
    return Array.from({ length: 5 }, (_, i) => ({
      id: ++this.#counter,
      name: `Item ${this.#counter}`,
      time: now,
    }));
  }
}

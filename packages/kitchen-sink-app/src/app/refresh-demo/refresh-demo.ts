import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-refresh-demo',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  template: `
    <refresh (bindstartrefresh)="onRefresh()">
      <refresh-header>
        <view class="refresh-header">
          <text class="refresh-header-text">
            {{ refreshing() ? 'Refreshing...' : 'Pull down to refresh' }}
          </text>
        </view>
      </refresh-header>
      <scroll-view scroll-orientation="vertical" style="height: 100vh;">
        <view class="container">
          <text class="title">Refresh Demo</text>
          <text class="subtitle">
            Pull down to reload the list (refreshed {{ refreshCount() }} times)
          </text>
          @for (item of items(); track item.id) {
            <view class="item">
              <text class="item-name">{{ item.name }}</text>
              <text class="item-time">{{ item.time }}</text>
            </view>
          }
        </view>
      </scroll-view>
    </refresh>
  `,
  styles: [
    `
      .refresh-header {
        height: 60px;
        align-items: center;
        justify-content: center;
      }

      .refresh-header-text {
        font-size: 14px;
        color: #666;
      }

      .container {
        padding: 16px;
      }

      .title {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 8px;
      }

      .subtitle {
        font-size: 14px;
        color: #666;
        margin-bottom: 16px;
      }

      .item {
        padding: 16px;
        margin-bottom: 8px;
        background-color: #f5f5f5;
        border-radius: 8px;
      }

      .item-name {
        font-size: 16px;
        font-weight: bold;
      }

      .item-time {
        font-size: 12px;
        color: #999;
        margin-top: 4px;
      }
    `,
  ],
})
export class RefreshDemo {
  #counter = 0;

  refreshing = signal(false);
  refreshCount = signal(0);
  items = signal(this.#generateItems());

  onRefresh(): void {
    this.refreshing.set(true);
    setTimeout(() => {
      this.items.set(this.#generateItems());
      this.refreshCount.update((c) => c + 1);
      this.refreshing.set(false);
    }, 1500);
  }

  #generateItems(): { id: number; name: string; time: string }[] {
    const now = new Date().toLocaleTimeString();
    return Array.from({ length: 8 }, () => ({
      id: ++this.#counter,
      name: `Item ${this.#counter}`,
      time: now,
    }));
  }
}

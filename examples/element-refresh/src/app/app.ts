import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <refresh (bindstartrefresh)="onRefresh()">
      <refresh-header>
        <view class="refresh-header">
          <text class="refresh-text">
            {{ refreshing() ? 'Refreshing...' : 'Pull down to refresh' }}
          </text>
        </view>
      </refresh-header>
      <scroll-view class="page" scroll-orientation="vertical">
        <view class="container">
          <text class="title">Refresh Element</text>
          <text class="subtitle">Pull down to reload the list.</text>

          @for (item of items(); track item.id) {
            <view class="item-card">
              <text class="item-name">{{ item.name }}</text>
              <text class="item-time">Added {{ item.time }}</text>
            </view>
          }
        </view>
      </scroll-view>
    </refresh>
  `,
  styles: `
    .page { height: 100vh; background-color: #fafafa; }
    .container { padding: 24px; }
    .title { font-size: 28px; font-weight: bold; color: #18181b; margin-bottom: 4px; }
    .subtitle { font-size: 13px; color: #71717a; margin-bottom: 20px; }
    .refresh-header { height: 60px; align-items: center; justify-content: center; }
    .refresh-text { font-size: 13px; color: #a1a1aa; }
    .item-card { padding: 14px 16px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; margin-bottom: 8px; }
    .item-name { font-size: 15px; color: #18181b; font-weight: 500; }
    .item-time { font-size: 12px; color: #a1a1aa; margin-top: 4px; }
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  #counter = 0;

  readonly refreshing = signal(false);
  readonly items = signal(this.#generateItems());

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

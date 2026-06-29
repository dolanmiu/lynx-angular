import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-refresh-demo',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  template: `
    <refresh (bindstartrefresh)="onRefresh()">
      <refresh-header>
        <view class="h-[60px] items-center justify-center">
          <text class="text-sm text-gray-500">
            {{ refreshing() ? 'Refreshing...' : 'Pull down to refresh' }}
          </text>
        </view>
      </refresh-header>
      <scroll-view scroll-orientation="vertical" class="h-screen">
        <view class="p-4">
          <text class="text-[24px] font-bold mb-2">Refresh Demo</text>
          <text class="text-sm text-gray-500 mb-4">
            Pull down to reload the list (refreshed {{ refreshCount() }} times)
          </text>
          @for (item of items(); track item.id) {
            <view class="p-4 mb-2 bg-gray-100 rounded-lg">
              <text class="text-base font-bold">{{ item.name }}</text>
              <text class="text-xs text-gray-400 mt-1">{{ item.time }}</text>
            </view>
          }
        </view>
      </scroll-view>
    </refresh>
  `,
})
export class RefreshDemo {
  #counter = 0;

  refreshing = signal(false);
  refreshCount = signal(0);
  items = signal(this.#generateItems());

  onRefresh(): void {
    this.refreshing.set(true);
    // Simulate a 1.5s network request. Signal updates here are safe: the
    // `bindstartrefresh` handler fires on the background thread, not the
    // main-thread event path, so no synchronous flush concern.
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

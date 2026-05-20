import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <view style="padding: 24px;">
      <text style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">
        Event Handling
      </text>

      <text style="font-size: 14px; color: #666; margin-bottom: 16px;">
        Tap the outer or inner box to see how events propagate.
      </text>

      <view
        style="background-color: #e8eaf6; padding: 24px; border-radius: 12px; align-items: center;"
        (bindtap)="onOuterTap()"
      >
        <text style="font-size: 14px; margin-bottom: 12px;">
          Outer (bindtap — bubbles)
        </text>

        <view
          style="background-color: #6200ee; padding: 16px 24px; border-radius: 8px;"
          (catchtap)="onInnerTap()"
        >
          <text style="color: white; font-size: 14px;">
            Inner (catchtap — stops propagation)
          </text>
        </view>
      </view>

      <view
        style="margin-top: 16px; padding: 12px; background-color: #f5f5f5; border-radius: 8px;"
      >
        <text style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">
          Event Log:
        </text>
        @for (entry of log(); track $index) {
          <text style="font-size: 13px; color: #333;">{{ entry }}</text>
        } @empty {
          <text style="font-size: 13px; color: #999;">
            Tap a box to see events
          </text>
        }
      </view>
    </view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class AppComponent {
  log = signal<string[]>([]);

  onOuterTap(): void {
    this.log.update((entries) => [...entries.slice(-4), 'Outer tapped (bind)']);
  }

  onInnerTap(): void {
    this.log.update((entries) => [
      ...entries.slice(-4),
      'Inner tapped (catch — stopped)',
    ]);
  }
}

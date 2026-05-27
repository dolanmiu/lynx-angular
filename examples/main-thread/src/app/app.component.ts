import { Component, signal } from '@angular/core';
import {
  LYNX_ELEMENTS,
  LynxMainThreadEvent,
  mainThreadFn,
  backgroundFn,
  createMainThreadRef,
} from '@blotch/angular-lynx';
import type { MainThread } from '@blotch/angular-lynx';

// --- Main Thread Refs ---
// Persist state across main-thread function calls.
const tapCount = createMainThreadRef(0);

// --- Background Functions ---
// Registered on the background thread. Callable from main-thread via runOnBackground().
let _lastColor = '';
const notifyColorChange = backgroundFn((color: string) => {
  _lastColor = color;
});

// --- Main Thread Functions ---
// Execute synchronously on the main thread — zero cross-thread latency.

const handleTap = mainThreadFn((event: MainThread.TouchEvent) => {
  const el = event.currentTarget;
  tapCount.current++;

  const colors = ['#6200ee', '#03dac6', '#ff5722', '#4caf50', '#ff9800'];
  const color = colors[tapCount.current % colors.length]!;
  el.setStyleProperty('background-color', color);

  // Notify the background thread about the color change
  runOnBackground(notifyColorChange, color);
});

const handleTouchMove = mainThreadFn((event: MainThread.TouchEvent) => {
  const touch = event.touches[0];
  if (!touch) return;
  const opacity = Math.max(0.3, Math.min(1, touch.clientX / 300));
  event.currentTarget.setStyleProperty('opacity', String(opacity));
});

const handleTouchEnd = mainThreadFn((event: MainThread.TouchEvent) => {
  event.currentTarget.setStyleProperty('opacity', '1');
});

@Component({
  selector: 'app-root',
  template: `
    <view style="padding: 24px;">
      <text style="font-size: 20px; font-weight: bold; margin-bottom: 16px;">
        Main Thread Scripts
      </text>

      <text style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">
        Instant Color Change (mainThreadFn + MainThreadRef)
      </text>
      <view
        [mainThreadBindtap]="handleTap"
        style="height: 100px; background-color: #6200ee; border-radius: 12px;
               justify-content: center; align-items: center;"
      >
        <text style="color: white; font-size: 16px;">Tap to change color</text>
      </view>

      <text
        style="font-size: 14px; font-weight: bold; margin-top: 16px; margin-bottom: 8px;"
      >
        Touch Tracking (mainThreadFn)
      </text>
      <view
        [mainThreadBindtouchmove]="handleTouchMove"
        [mainThreadBindtouchend]="handleTouchEnd"
        style="height: 100px; background-color: #1976d2; border-radius: 12px;
               justify-content: center; align-items: center;"
      >
        <text style="color: white; font-size: 16px;">
          Drag to change opacity
        </text>
      </view>

      <text
        style="font-size: 14px; font-weight: bold; margin-top: 16px; margin-bottom: 8px;"
      >
        Background Thread Comparison
      </text>
      <view
        (bindtap)="onBgTap()"
        style="height: 80px; background-color: #757575; border-radius: 12px;
               justify-content: center; align-items: center;"
      >
        <text style="color: white; font-size: 16px;">
          Background taps: {{ bgTapCount() }}
        </text>
      </view>
    </view>
  `,
  imports: [LYNX_ELEMENTS, LynxMainThreadEvent],
})
export class AppComponent {
  readonly handleTap = handleTap;
  readonly handleTouchMove = handleTouchMove;
  readonly handleTouchEnd = handleTouchEnd;
  readonly bgTapCount = signal(0);

  onBgTap(): void {
    this.bgTapCount.update((v) => v + 1);
  }
}

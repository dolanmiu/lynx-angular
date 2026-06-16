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

  const colors = ['#6366f1', '#22c55e', '#f97316', '#3b82f6', '#ef4444'];
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
    <scroll-view class="page" scroll-orientation="vertical">
      <view class="container">
        <text class="title">Main Thread Scripts</text>
        <text class="subtitle">Zero-latency UI updates via main-thread execution.</text>

        <view class="card">
          <text class="section-label">Instant Color Change</text>
          <text class="hint">mainThreadFn + MainThreadRef</text>
          <view
            [mainThreadBindtap]="handleTap"
            class="demo-box color-box"
          >
            <text class="demo-text">Tap to change color</text>
          </view>
        </view>

        <view class="card">
          <text class="section-label">Touch Tracking</text>
          <text class="hint">mainThreadFn</text>
          <view
            [mainThreadBindtouchmove]="handleTouchMove"
            [mainThreadBindtouchend]="handleTouchEnd"
            class="demo-box touch-box"
          >
            <text class="demo-text">Drag to change opacity</text>
          </view>
        </view>

        <view class="card">
          <text class="section-label">Background Thread</text>
          <text class="hint">For comparison — round-trip latency</text>
          <view (bindtap)="onBgTap()" class="demo-box bg-box">
            <text class="demo-text">Background taps: {{ bgTapCount() }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  `,
  styles: `
    .page { height: 100%; background-color: #fafafa; }
    .container { padding: 24px; }
    .title { font-size: 28px; font-weight: bold; color: #18181b; margin-bottom: 4px; }
    .subtitle { font-size: 13px; color: #71717a; margin-bottom: 20px; }
    .card { background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
    .section-label { font-size: 11px; font-weight: 700; color: #a1a1aa; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .hint { font-size: 12px; color: #a1a1aa; margin-bottom: 12px; }
    .demo-box { height: 80px; border-radius: 10px; justify-content: center; align-items: center; }
    .demo-text { color: white; font-size: 15px; font-weight: 500; }
    .color-box { background-color: #6366f1; }
    .touch-box { background-color: #3b82f6; }
    .bg-box { background-color: #71717a; }
  `,
  imports: [LYNX_ELEMENTS, LynxMainThreadEvent],
})
export class App {
  readonly handleTap = handleTap;
  readonly handleTouchMove = handleTouchMove;
  readonly handleTouchEnd = handleTouchEnd;
  readonly bgTapCount = signal(0);

  onBgTap(): void {
    this.bgTapCount.update((v) => v + 1);
  }
}

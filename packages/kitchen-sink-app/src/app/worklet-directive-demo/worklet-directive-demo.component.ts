import { Component, signal } from '@angular/core';
import {
  LYNX_ELEMENTS,
  LynxMainThreadEvent,
  createMainThreadRef,
} from '@blotch/angular-lynx';
import type { MainThread } from '@blotch/angular-lynx';

// --- Worklet-transformed functions ---
// These use the "main thread" directive instead of wrapping with mainThreadFn().
// The build plugin detects the directive and wraps automatically.

const tapCount = createMainThreadRef(0);

const handleColorTap = (event: MainThread.TouchEvent) => {
  'main thread';
  const el = event.currentTarget;
  tapCount.current++;
  const colors = ['#6200ee', '#03dac6', '#ff5722', '#4caf50', '#e91e63'];
  const color = colors[tapCount.current % colors.length]!;
  el.setStyleProperty('background-color', color);
};

const handleOpacityMove = (event: MainThread.TouchEvent) => {
  'main thread';
  const el = event.currentTarget;
  const touch = event.touches[0]!;
  const rect = (el as any).getBoundingClientRect();
  const relX = (touch.clientX - rect.left) / rect.width;
  el.setStyleProperty('opacity', String(Math.max(0.3, Math.min(1, relX))));
};

const handleOpacityEnd = (event: MainThread.TouchEvent) => {
  'main thread';
  event.currentTarget.setStyleProperty('opacity', '1');
};

const handleScaleTap = (event: MainThread.TouchEvent) => {
  'main thread';
  const el = event.currentTarget;
  el.setStyleProperty('transform', 'scale(0.9)');
  setTimeout(() => {
    el.setStyleProperty('transform', 'scale(1)');
  }, 150);
};

@Component({
  selector: 'app-worklet-directive-demo',
  standalone: true,
  imports: [LYNX_ELEMENTS, LynxMainThreadEvent],
  styles: [
    `
      .demo-container {
        padding: 16px;
      }
      .title {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 16px;
        color: #1a1a2e;
      }
      .section-label {
        font-size: 14px;
        color: #666;
        margin-bottom: 8px;
        margin-top: 16px;
      }
      .demo-box {
        padding: 20px;
        border-radius: 12px;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;
      }
      .demo-text {
        color: white;
        font-size: 16px;
        font-weight: 500;
      }
      .code-hint {
        font-size: 12px;
        color: #999;
        margin-top: 4px;
        font-style: italic;
      }
    `,
  ],
  template: `
    <scroll-view scroll-orientation="vertical" class="demo-container">
      <text class="title">Worklet Directive Demo</text>
      <text class="section-label">
        Uses "main thread" directive instead of mainThreadFn()
      </text>

      <text class="section-label">Tap — cycles background color</text>
      <view
        class="demo-box"
        style="background-color: #6200ee;"
        [mainThreadBindtap]="handleColorTap"
      >
        <text class="demo-text">Tap me</text>
        <text class="code-hint">"main thread" directive</text>
      </view>

      <text class="section-label">Touch move — adjusts opacity</text>
      <view
        class="demo-box"
        style="background-color: #0077b6;"
        [mainThreadBindtouchmove]="handleOpacityMove"
        [mainThreadBindtouchend]="handleOpacityEnd"
      >
        <text class="demo-text">Slide finger left/right</text>
        <text class="code-hint">Opacity tracks finger position</text>
      </view>

      <text class="section-label">Tap — scale bounce</text>
      <view
        class="demo-box"
        style="background-color: #2d6a4f;"
        [mainThreadBindtap]="handleScaleTap"
      >
        <text class="demo-text">Tap for bounce</text>
        <text class="code-hint">transform: scale() on main thread</text>
      </view>

      <text class="section-label">Background thread tap (for comparison)</text>
      <view
        class="demo-box"
        style="background-color: #555;"
        (bindtap)="onBgTap()"
      >
        <text class="demo-text">BG taps: {{ bgTapCount() }}</text>
        <text class="code-hint">Standard Angular event (cross-thread)</text>
      </view>
    </scroll-view>
  `,
})
export class WorkletDirectiveDemoComponent {
  readonly handleColorTap = handleColorTap;
  readonly handleOpacityMove = handleOpacityMove;
  readonly handleOpacityEnd = handleOpacityEnd;
  readonly handleScaleTap = handleScaleTap;

  readonly bgTapCount = signal(0);

  onBgTap(): void {
    this.bgTapCount.update((v) => v + 1);
  }
}

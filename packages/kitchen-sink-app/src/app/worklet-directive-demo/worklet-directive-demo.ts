import { Component, signal } from '@angular/core';
import {
  LYNX_ELEMENTS,
  LynxMainThreadEvent,
  createMainThreadRef,
  type MainThread,
} from '@blotch/angular-lynx';

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
  template: `
    <scroll-view scroll-orientation="vertical" class="p-4">
      <text class="text-xl font-bold mb-4 text-[#1a1a2e]"
        >Worklet Directive Demo</text
      >
      <text class="text-sm text-gray-500 mb-2 mt-4">
        Uses "main thread" directive instead of mainThreadFn()
      </text>

      <text class="text-sm text-gray-500 mb-2 mt-4"
        >Tap — cycles background color</text
      >
      <view
        class="p-5 rounded-xl items-center justify-center mb-3 bg-[#6200ee]"
        [mainThreadBindtap]="handleColorTap"
      >
        <text class="text-white text-base font-medium">Tap me</text>
        <text class="text-xs text-gray-400 mt-1 italic"
          >"main thread" directive</text
        >
      </view>

      <text class="text-sm text-gray-500 mb-2 mt-4"
        >Touch move — adjusts opacity</text
      >
      <view
        class="p-5 rounded-xl items-center justify-center mb-3 bg-[#0077b6]"
        [mainThreadBindtouchmove]="handleOpacityMove"
        [mainThreadBindtouchend]="handleOpacityEnd"
      >
        <text class="text-white text-base font-medium"
          >Slide finger left/right</text
        >
        <text class="text-xs text-gray-400 mt-1 italic"
          >Opacity tracks finger position</text
        >
      </view>

      <text class="text-sm text-gray-500 mb-2 mt-4">Tap — scale bounce</text>
      <view
        class="p-5 rounded-xl items-center justify-center mb-3 bg-[#2d6a4f]"
        [mainThreadBindtap]="handleScaleTap"
      >
        <text class="text-white text-base font-medium">Tap for bounce</text>
        <text class="text-xs text-gray-400 mt-1 italic"
          >transform: scale() on main thread</text
        >
      </view>

      <text class="text-sm text-gray-500 mb-2 mt-4"
        >Background thread tap (for comparison)</text
      >
      <view
        class="p-5 rounded-xl items-center justify-center mb-3 bg-[#555]"
        (bindtap)="onBgTap()"
      >
        <text class="text-white text-base font-medium"
          >BG taps: {{ bgTapCount() }}</text
        >
        <text class="text-xs text-gray-400 mt-1 italic"
          >Standard Angular event (cross-thread)</text
        >
      </view>
    </scroll-view>
  `,
})
export class WorkletDirectiveDemo {
  readonly handleColorTap = handleColorTap;
  readonly handleOpacityMove = handleOpacityMove;
  readonly handleOpacityEnd = handleOpacityEnd;
  readonly handleScaleTap = handleScaleTap;

  readonly bgTapCount = signal(0);

  onBgTap(): void {
    this.bgTapCount.update((v) => v + 1);
  }
}

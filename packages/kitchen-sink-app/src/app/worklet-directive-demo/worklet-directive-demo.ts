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
      <text class="mb-4 text-xl font-bold text-[#1a1a2e]"
        >Worklet Directive Demo</text
      >
      <text class="mb-2 mt-4 text-sm text-gray-500">
        Uses "main thread" directive instead of mainThreadFn()
      </text>

      <text class="mb-2 mt-4 text-sm text-gray-500"
        >Tap — cycles background color</text
      >
      <view
        class="mb-3 items-center rounded-xl bg-[#6200ee] p-5 justify-center"
        [mainThreadBindtap]="handleColorTap"
      >
        <text class="text-base font-medium text-white">Tap me</text>
        <text class="mt-1 text-xs italic text-gray-400"
          >"main thread" directive</text
        >
      </view>

      <text class="mb-2 mt-4 text-sm text-gray-500"
        >Touch move — adjusts opacity</text
      >
      <view
        class="mb-3 items-center rounded-xl bg-[#0077b6] p-5 justify-center"
        [mainThreadBindtouchmove]="handleOpacityMove"
        [mainThreadBindtouchend]="handleOpacityEnd"
      >
        <text class="text-base font-medium text-white"
          >Slide finger left/right</text
        >
        <text class="mt-1 text-xs italic text-gray-400"
          >Opacity tracks finger position</text
        >
      </view>

      <text class="mb-2 mt-4 text-sm text-gray-500">Tap — scale bounce</text>
      <view
        class="mb-3 items-center rounded-xl bg-[#2d6a4f] p-5 justify-center"
        [mainThreadBindtap]="handleScaleTap"
      >
        <text class="text-base font-medium text-white">Tap for bounce</text>
        <text class="mt-1 text-xs italic text-gray-400"
          >transform: scale() on main thread</text
        >
      </view>

      <text class="mb-2 mt-4 text-sm text-gray-500"
        >Background thread tap (for comparison)</text
      >
      <view
        class="mb-3 items-center rounded-xl bg-[#555] p-5 justify-center"
        (bindtap)="onBgTap()"
      >
        <text class="text-base font-medium text-white"
          >BG taps: {{ bgTapCount() }}</text
        >
        <text class="mt-1 text-xs italic text-gray-400"
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

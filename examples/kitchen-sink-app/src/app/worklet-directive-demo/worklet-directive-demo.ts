import { Component, signal } from '@angular/core';
import {
  LYNX_ELEMENTS,
  LynxMainThreadEvent,
  createMainThreadRef,
  type MainThread,
} from '@blotch/angular-lynx';
import { UiText } from '../../components/ui/typography';
import { UiBadge } from '../../components/ui/badge';
import { ScreenHost } from '../screen-host';

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
  hostDirectives: [ScreenHost],
  standalone: true,
  imports: [LYNX_ELEMENTS, LynxMainThreadEvent, UiText, UiBadge],
  template: `
    <scroll-view scroll-orientation="vertical" class="h-full w-full p-4">
      <view class="flex-col gap-2 p-4 flex">
        <ui-text variant="h3">Worklet Directive</ui-text>
        <ui-badge variant="secondary">Platform</ui-badge>
      </view>
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

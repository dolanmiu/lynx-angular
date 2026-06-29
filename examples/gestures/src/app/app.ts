import { Component, signal } from '@angular/core';
import {
  Gesture,
  LynxGestureDetector,
  PanGesture,
  TapGesture,
  LYNX_ELEMENTS,
} from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="h-full bg-zinc-50" scroll-orientation="vertical">
      <view class="p-6">
        <text class="text-[28px] font-bold text-zinc-900 mb-1">Gestures</text>
        <text class="text-[13px] text-zinc-500 mb-5"
          >Pan, tap, and exclusive gesture recognition.</text
        >

        <view class="bg-white border border-zinc-200 rounded-xl p-4 mb-4">
          <text
            class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-3"
            >Pan Gesture</text
          >
          <view
            [lynxGesture]="panGesture"
            class="w-[100px] h-[100px] bg-indigo-500 rounded-[10px] items-center justify-content mb-2"
          >
            <text class="text-sm font-medium text-white">Drag me</text>
          </view>
          <text class="text-xs text-zinc-500"
            >X: {{ panX() }} Y: {{ panY() }}</text
          >
        </view>

        <view class="bg-white border border-zinc-200 rounded-xl p-4 mb-4">
          <text
            class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-3"
            >Tap Gesture</text
          >
          <view
            [lynxGesture]="tapGesture"
            class="py-3.5 px-6 bg-green-500 rounded-[10px] items-center justify-center"
          >
            <text class="text-[15px] text-white font-semibold"
              >Taps: {{ tapCount() }}</text
            >
          </view>
        </view>

        <view class="bg-white border border-zinc-200 rounded-xl p-4 mb-4">
          <text
            class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-3"
            >Exclusive (Pan vs Tap)</text
          >
          <view
            [lynxGesture]="exclusive"
            class="p-4 bg-orange-500 rounded-[10px] items-center justify-center"
          >
            <text class="text-sm font-medium text-white">{{ action() }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  `,
  imports: [LYNX_ELEMENTS, LynxGestureDetector],
})
export class App {
  readonly panX = signal(0);
  readonly panY = signal(0);
  readonly tapCount = signal(0);
  readonly action = signal('pan or tap this area');

  readonly panGesture = new PanGesture()
    .minDistance(5)
    .onUpdate((e) => {
      this.panX.set(Math.round(e.translationX));
      this.panY.set(Math.round(e.translationY));
    })
    .onEnd(() => {
      this.panX.set(0);
      this.panY.set(0);
    });

  readonly tapGesture = new TapGesture().onEnd(() =>
    this.tapCount.update((v) => v + 1),
  );

  readonly #exPan = new PanGesture()
    .minDistance(10)
    .onUpdate((e) =>
      this.action.set(
        `pan x:${Math.round(e.translationX)} y:${Math.round(e.translationY)}`,
      ),
    )
    .onEnd(() => this.action.set('pan ended'));

  readonly #exTap = new TapGesture().onEnd(() =>
    this.action.set('tap detected'),
  );

  readonly exclusive = Gesture.Exclusive(this.#exPan, this.#exTap);
}

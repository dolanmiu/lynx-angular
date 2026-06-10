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
    <scroll-view scroll-orientation="vertical" style="height: 100%;">
      <view style="padding: 24px;">
        <text style="font-size: 20px; font-weight: bold; margin-bottom: 16px;">
          Gestures
        </text>

        <text style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">
          Pan Gesture
        </text>
        <view
          [lynxGesture]="panGesture"
          style="width: 100px; height: 100px; background-color: #6200ee; border-radius: 8px; align-items: center; justify-content: center; margin-bottom: 8px;"
        >
          <text style="color: white; font-size: 14px;">Drag me</text>
        </view>
        <text style="font-size: 12px; color: #666; margin-bottom: 16px;">
          X: {{ panX() }} Y: {{ panY() }}
        </text>

        <text style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">
          Tap Gesture
        </text>
        <view
          [lynxGesture]="tapGesture"
          style="padding: 12px 24px; background-color: #03dac6; border-radius: 8px; margin-bottom: 16px;"
        >
          <text style="font-size: 16px;">Taps: {{ tapCount() }}</text>
        </view>

        <text style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">
          Exclusive (Pan vs Tap)
        </text>
        <view
          [lynxGesture]="exclusive"
          style="padding: 16px; background-color: #ff9800; border-radius: 8px;"
        >
          <text style="font-size: 14px;">{{ action() }}</text>
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

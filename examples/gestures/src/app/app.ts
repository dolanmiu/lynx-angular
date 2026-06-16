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
    <scroll-view class="page" scroll-orientation="vertical">
      <view class="container">
        <text class="title">Gestures</text>
        <text class="subtitle">Pan, tap, and exclusive gesture recognition.</text>

        <view class="card">
          <text class="section-label">Pan Gesture</text>
          <view [lynxGesture]="panGesture" class="gesture-box pan-box">
            <text class="gesture-text">Drag me</text>
          </view>
          <text class="coords">X: {{ panX() }}  Y: {{ panY() }}</text>
        </view>

        <view class="card">
          <text class="section-label">Tap Gesture</text>
          <view [lynxGesture]="tapGesture" class="gesture-box tap-box">
            <text class="tap-text">Taps: {{ tapCount() }}</text>
          </view>
        </view>

        <view class="card">
          <text class="section-label">Exclusive (Pan vs Tap)</text>
          <view [lynxGesture]="exclusive" class="gesture-box exclusive-box">
            <text class="gesture-text">{{ action() }}</text>
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
    .section-label { font-size: 11px; font-weight: 700; color: #a1a1aa; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .gesture-box { align-items: center; justify-content: center; border-radius: 10px; }
    .gesture-text { color: white; font-size: 14px; font-weight: 500; }
    .pan-box { width: 100px; height: 100px; background-color: #6366f1; margin-bottom: 8px; }
    .tap-box { padding: 14px 24px; background-color: #22c55e; }
    .tap-text { font-size: 15px; color: white; font-weight: 600; }
    .exclusive-box { padding: 16px; background-color: #f97316; }
    .coords { font-size: 12px; color: #71717a; }
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

import { Component, signal } from '@angular/core';
import {
  Gesture,
  LongPressGesture,
  LynxGestureDetector,
  PanGesture,
  TapGesture,
  LYNX_ELEMENTS,
} from '@blotch/angular-lynx';
import { UiText } from '../../components/ui/typography';
import { UiBadge } from '../../components/ui/badge';

@Component({
  selector: 'app-gesture-demo',
  standalone: true,
  imports: [LYNX_ELEMENTS, LynxGestureDetector, UiText, UiBadge],
  templateUrl: './gesture-demo.html',
  styleUrl: './gesture-demo.css',
})
export class GestureDemo {
  // ── Pan gesture state ──
  readonly panX = signal(0);
  readonly panY = signal(0);

  readonly panGesture = new PanGesture()
    .minDistance(5)
    .onUpdate((event) => {
      this.panX.set(Math.round(event.translationX));
      this.panY.set(Math.round(event.translationY));
    })
    .onEnd(() => {
      this.panX.set(0);
      this.panY.set(0);
    });

  // ── Tap gesture state ──
  readonly tapCount = signal(0);

  readonly tapGesture = new TapGesture().onEnd(() => {
    this.tapCount.update((v) => v + 1);
  });

  readonly doubleTapGesture = new TapGesture().numberOfTaps(2).onEnd(() => {
    this.tapCount.set(0);
  });

  // ── Long press gesture state ──
  readonly longPressActive = signal(false);

  readonly longPressGesture = new LongPressGesture()
    .minDuration(500)
    .onStart(() => {
      this.longPressActive.set(true);
    })
    .onEnd(() => {
      this.longPressActive.set(false);
    });

  // ── Composition: exclusive (pan vs tap on same element) ──
  readonly composedTap = new TapGesture().onEnd(() => {
    this.composedAction.set('tap detected');
  });
  readonly composedPan = new PanGesture()
    .minDistance(10)
    .onStart(() => {
      this.composedAction.set('pan started');
    })
    .onUpdate((e) => {
      this.composedAction.set(
        `pan x:${Math.round(e.translationX)} y:${Math.round(e.translationY)}`,
      );
    })
    .onEnd(() => {
      this.composedAction.set('pan ended');
    });

  // Exclusive: gesture system tries each in order; the first one to enter
  // its active state wins and cancels the others. Here pan wins over tap
  // because it has a minDistance(10) threshold — short movements still
  // resolve as taps since pan fails until the distance requirement is met.
  readonly exclusiveGesture = Gesture.Exclusive(
    this.composedPan,
    this.composedTap,
  );
  readonly composedAction = signal('none');
}

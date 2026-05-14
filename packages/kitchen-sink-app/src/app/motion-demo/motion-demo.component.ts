import { Component, signal, viewChild, type ElementRef } from '@angular/core';
import { LYNX_ELEMENTS, type LynxAnimation } from '@blotch/angular-lynx';

@Component({
  selector: 'app-motion-demo',
  template: `
    <view class="demo-container">
      <!-- ── CSS Transition Demo ── -->
      <view class="demo-section">
        <text class="section-title">CSS Transitions</text>
        <view
          class="transition-box"
          [class.transition-box-active]="transitionActive()"
          (bindtap)="toggleTransition()"
        >
          <text class="transition-label">Tap me</text>
        </view>
        <text class="tap-hint"
          >Toggles background-color with a 0.5s transition</text
        >
      </view>

      <!-- ── CSS Keyframe Animation Demo ── -->
      <view class="demo-section">
        <text class="section-title">CSS Keyframe Animations</text>
        <view class="keyframe-row">
          <view
            class="keyframe-box"
            [class.keyframe-box-rotating]="rotateActive()"
            (bindtap)="toggleRotate()"
          >
            <text class="keyframe-label">Rotate</text>
          </view>
          <view
            class="keyframe-box"
            [class.keyframe-box-pulsing]="pulseActive()"
            (bindtap)="togglePulse()"
          >
            <text class="keyframe-label">Pulse</text>
          </view>
        </view>
        <text class="tap-hint"
          >Tap to toggle @keyframes rotate / pulse animations</text
        >
      </view>

      <!-- ── JS Animate API Demo ── -->
      <view class="demo-section">
        <text class="section-title">JS Animate API</text>
        <view #animateBox class="animate-box" (bindtap)="runAnimation()">
          <text class="animate-label">Tap to animate</text>
        </view>
        <text class="tap-hint"
          >Runs a programmatic scale + opacity animation via
          element.animate()</text
        >
      </view>
    </view>
  `,
  styleUrl: './motion-demo.component.css',
  imports: [LYNX_ELEMENTS],
})
export class MotionDemoComponent {
  transitionActive = signal(false);
  rotateActive = signal(false);
  pulseActive = signal(false);

  // ViewChild gives us the native LynxElement for the JS animate API.
  animateBoxRef = viewChild<ElementRef>('animateBox');

  #currentAnimation: LynxAnimation | null = null;

  toggleTransition(): void {
    setTimeout(() => this.transitionActive.update((v) => !v), 0);
  }

  toggleRotate(): void {
    setTimeout(() => this.rotateActive.update((v) => !v), 0);
  }

  togglePulse(): void {
    setTimeout(() => this.pulseActive.update((v) => !v), 0);
  }

  runAnimation(): void {
    setTimeout(() => {
      const el = this.animateBoxRef();
      if (!el) return;

      // Cancel any previously running animation so they don't stack.
      this.#currentAnimation?.cancel();

      this.#currentAnimation = el.nativeElement.animate(
        [
          { transform: 'scale(1)', opacity: 1 },
          { transform: 'scale(1.3)', opacity: 0.7 },
          { transform: 'scale(1)', opacity: 1 },
        ],
        {
          duration: 600,
          easing: 'ease-in-out',
        },
      );
    }, 0);
  }
}

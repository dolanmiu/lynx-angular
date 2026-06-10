import { Component, signal, viewChild, type ElementRef } from '@angular/core';
import { LYNX_ELEMENTS, type LynxAnimation } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view scroll-orientation="vertical" style="height: 100%;">
      <view style="padding: 24px;">
        <text style="font-size: 20px; font-weight: bold; margin-bottom: 16px;">
          Animations
        </text>

        <text style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">
          CSS Transition
        </text>
        <view
          class="transition-box"
          [class.transition-active]="transitionOn()"
          (bindtap)="toggleTransition()"
        >
          <text style="color: white; font-size: 14px;">Tap to toggle</text>
        </view>

        <text
          style="font-size: 14px; font-weight: bold; margin-top: 16px; margin-bottom: 8px;"
        >
          CSS Keyframes
        </text>
        <view
          class="keyframe-box"
          [class.spinning]="spinOn()"
          (bindtap)="toggleSpin()"
        >
          <text style="color: white; font-size: 14px;">Tap to spin</text>
        </view>

        <text
          style="font-size: 14px; font-weight: bold; margin-top: 16px; margin-bottom: 8px;"
        >
          JS animate() API
        </text>
        <view #animBox class="animate-box" (bindtap)="runAnimation()">
          <text style="color: white; font-size: 14px;">Tap to pulse</text>
        </view>
      </view>
    </scroll-view>
  `,
  styles: [
    `
      .transition-box {
        width: 120px;
        height: 60px;
        background-color: #6200ee;
        border-radius: 8px;
        align-items: center;
        justify-content: center;
        transition: background-color 0.5s ease-in-out;
      }
      .transition-active {
        background-color: #03dac6;
      }

      @keyframes rotate {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
      .keyframe-box {
        width: 80px;
        height: 80px;
        background-color: #ff5722;
        border-radius: 8px;
        align-items: center;
        justify-content: center;
      }
      .spinning {
        animation: rotate 1s linear infinite;
      }

      .animate-box {
        width: 120px;
        height: 60px;
        background-color: #2196f3;
        border-radius: 8px;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
  imports: [LYNX_ELEMENTS],
})
export class App {
  readonly transitionOn = signal(false);
  readonly spinOn = signal(false);
  readonly animBoxRef = viewChild<ElementRef>('animBox');

  #anim: LynxAnimation | null = null;

  toggleTransition(): void {
    setTimeout(() => this.transitionOn.update((v) => !v), 0);
  }

  toggleSpin(): void {
    setTimeout(() => this.spinOn.update((v) => !v), 0);
  }

  runAnimation(): void {
    setTimeout(() => {
      const el = this.animBoxRef();
      if (!el) return;
      this.#anim?.cancel();
      this.#anim = el.nativeElement.animate(
        [
          { transform: 'scale(1)', opacity: 1 },
          { transform: 'scale(1.3)', opacity: 0.7 },
          { transform: 'scale(1)', opacity: 1 },
        ],
        { duration: 600, easing: 'ease-in-out' },
      );
    }, 0);
  }
}

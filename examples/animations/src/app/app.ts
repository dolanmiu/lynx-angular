import { Component, signal, viewChild, type ElementRef } from '@angular/core';
import { LYNX_ELEMENTS, type LynxAnimation } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="page" scroll-orientation="vertical">
      <view class="container">
        <text class="title">Animations</text>
        <text class="subtitle">CSS transitions, keyframes, and the JS animate() API.</text>

        <view class="card">
          <text class="section-label">CSS Transition</text>
          <view
            class="demo-box transition-box"
            [class.transition-active]="transitionOn()"
            (bindtap)="toggleTransition()"
          >
            <text class="demo-text">Tap to toggle</text>
          </view>
        </view>

        <view class="card">
          <text class="section-label">CSS Keyframes</text>
          <view
            class="demo-box keyframe-box"
            [class.spinning]="spinOn()"
            (bindtap)="toggleSpin()"
          >
            <text class="demo-text">Tap to spin</text>
          </view>
        </view>

        <view class="card">
          <text class="section-label">JS animate() API</text>
          <view #animBox class="demo-box animate-box" (bindtap)="runAnimation()">
            <text class="demo-text">Tap to pulse</text>
          </view>
        </view>
      </view>
    </scroll-view>
  `,
  styles: [
    `
      .page { height: 100%; background-color: #fafafa; }
      .container { padding: 24px; }
      .title { font-size: 28px; font-weight: bold; color: #18181b; margin-bottom: 4px; }
      .subtitle { font-size: 13px; color: #71717a; margin-bottom: 20px; }
      .card { background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
      .section-label { font-size: 11px; font-weight: 700; color: #a1a1aa; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
      .demo-box { align-items: center; justify-content: center; border-radius: 10px; }
      .demo-text { color: white; font-size: 14px; font-weight: 500; }

      .transition-box {
        width: 140px; height: 60px;
        background-color: #6366f1;
        transition: background-color 0.5s ease-in-out;
      }
      .transition-active { background-color: #22c55e; }

      @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .keyframe-box { width: 80px; height: 80px; background-color: #f97316; }
      .spinning { animation: rotate 1s linear infinite; }

      .animate-box { width: 140px; height: 60px; background-color: #3b82f6; }
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

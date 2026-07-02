import { Component, inject, signal } from '@angular/core';
import { LYNX_ELEMENTS, LynxMainThreadEvent, LynxMainThread, mainThreadFn, backgroundFn, createMainThreadRef, type MainThread } from '@blotch/angular-lynx';

// --- Main Thread Functions ---
// These run on the main thread with direct access to native elements.
// They execute with zero cross-thread latency, making them ideal for
// touch-driven UI updates like color changes and style manipulation.

const tapCount = createMainThreadRef(0);

const handleTap = mainThreadFn((event: MainThread.TouchEvent) => {
  const el = event.currentTarget;
  tapCount.current++;

  const colors = ['#6200ee', '#03dac6', '#ff5722', '#4caf50', '#ff9800'];
  const color = colors[tapCount.current % colors.length]!;
  el.setStyleProperty('background-color', color);
});

const handleTouchMove = mainThreadFn((event: MainThread.TouchEvent) => {
  const el = event.currentTarget;
  const rect = (el as any).getBoundingClientRect();
  const relativeX = (event.touches[0]!.clientX - rect.left) / rect.width;
  const opacity = Math.max(0.3, Math.min(1, relativeX));
  el.setStyleProperty('opacity', String(opacity));
});

const handleTouchEnd = mainThreadFn((_event: MainThread.TouchEvent) => {
  const el = _event.currentTarget;
  el.setStyleProperty('opacity', '1');
});

// --- Background Functions ---
// These run on the background thread (where Angular lives). They're
// registered with backgroundFn() and can be called from main-thread
// handlers via runOnBackground(). This lets you do instant visual
// feedback on the main thread, then dispatch heavier work (state updates,
// API calls, analytics) to the background thread.

let bgCounter = 0;

const incrementBgCounter = backgroundFn(() => {
  bgCounter++;
  return bgCounter;
});

/**
 * Main-thread handler that does instant visual feedback THEN dispatches
 * to the background thread to update app state.
 */
const handleCrossThreadTap = mainThreadFn((event: MainThread.TouchEvent) => {
  const el = event.currentTarget;

  // Instant visual feedback on the main thread (no latency)
  const scale = 0.9 + Math.random() * 0.2;
  el.setStyleProperty('opacity', String(scale));

  // Dispatch to background thread for state update
  (globalThis as any).runOnBackground(incrementBgCounter);

  // Reset opacity after a brief moment
  setTimeout(() => {
    el.setStyleProperty('opacity', '1');
  }, 150);
});

/**
 * Main-thread function callable from the background thread via
 * LynxMainThread.runOnMainThread(). Demonstrates background→main
 * communication for triggering native animations or element manipulation.
 */
const flashElement = mainThreadFn((color: string, elementSelector: string) => {
  const page = __GetPageElement();
  const target = __QuerySelector(page, elementSelector, {});
  if (!target) return;
  __AddInlineStyle(target, 'background-color', color);
  __FlushElementTree();
  setTimeout(() => {
    __AddInlineStyle(target, 'background-color', '#4a148c');
    __FlushElementTree();
  }, 300);
});

@Component({
  selector: 'app-main-thread-demo',
  standalone: true,
  imports: [LYNX_ELEMENTS, LynxMainThreadEvent],
  templateUrl: './main-thread-demo.html',
  styleUrl: './main-thread-demo.css',
})
export class MainThreadDemo {
  readonly #mts = inject(LynxMainThread);

  // Expose handles to the template
  readonly handleTap = handleTap;
  readonly handleTouchMove = handleTouchMove;
  readonly handleTouchEnd = handleTouchEnd;
  readonly handleCrossThreadTap = handleCrossThreadTap;

  // Background-thread tap counter for comparison
  readonly bgTapCount = signal(0);
  readonly crossThreadCount = signal(0);

  onBackgroundTap(): void {
    this.bgTapCount.update((v) => v + 1);
  }

  /**
   * Background → Main Thread: call a main-thread function from Angular code
   */
  onFlashFromBackground(): void {
    const colors = ['#e91e63', '#00bcd4', '#ffeb3b', '#8bc34a'];
    const color = colors[Math.floor(Math.random() * colors.length)]!;
    this.#mts.runOnMainThread(flashElement, color, '.flash-target');
  }

  /**
   * Polls the background counter (updated by cross-thread tap via runOnBackground)
   */
  onCrossThreadTap(): void {
    this.crossThreadCount.update((v) => v + 1);
  }
}

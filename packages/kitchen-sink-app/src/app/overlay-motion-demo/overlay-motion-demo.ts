import { Component, signal, viewChild, type ElementRef } from '@angular/core';
import { LYNX_ELEMENTS, type LynxAnimation } from '@blotch/angular-lynx';

@Component({
  selector: 'app-overlay-motion-demo',
  template: `
    <view class="demo-container">
      <text class="section-title">Motion + Overlay</text>
      <text class="description">
        Tap the button to open a dialog with smooth enter/exit animations using
        the JS animate API.
      </text>

      <view class="open-button" (bindtap)="open()">
        <text class="open-button-text">Open Dialog</text>
      </view>

      <overlay [attr.visible]="overlayVisible()" class="fixed overflow-visible">
        <view #backdrop class="backdrop" (bindtap)="close()">
          <view #dialog class="dialog" (catchtap)="onPanelTap()">
            <text class="dialog-title">Animated Dialog</text>
            <text class="dialog-body">
              This overlay opens with a combined fade + scale animation and
              closes with the reverse. Built using Lynx's JS animate API.
            </text>
            <view class="dialog-actions">
              <view class="action-button cancel-button" (catchtap)="close()">
                <text class="action-button-text">Cancel</text>
              </view>
              <view class="action-button confirm-button" (catchtap)="close()">
                <text class="action-button-text confirm-text">Confirm</text>
              </view>
            </view>
          </view>
        </view>
      </overlay>
    </view>
  `,
  styleUrl: './overlay-motion-demo.css',
  imports: [LYNX_ELEMENTS],
})
export class OverlayMotionDemo {
  overlayVisible = signal(false);

  backdropRef = viewChild<ElementRef>('backdrop');
  dialogRef = viewChild<ElementRef>('dialog');

  #backdropAnim: LynxAnimation | null = null;
  #dialogAnim: LynxAnimation | null = null;

  open(): void {
    setTimeout(() => {
      // Show the overlay first so the elements exist in the render tree.
      this.overlayVisible.set(true);

      // Animate in on the next tick — the overlay needs a frame to mount.
      setTimeout(() => this.#animateIn(), 0);
    }, 0);
  }

  /**
   * No-op tap handler for the dialog panel. `catchtap` already stops the tap
   * from bubbling to the backdrop (which would close the dialog) — Lynx
   * controls propagation via the event prefix, not `event.stopPropagation()`.
   */
  onPanelTap(): void {}

  close(): void {
    setTimeout(() => {
      this.#animateOut();
    }, 0);
  }

  #animateIn(): void {
    const backdrop = this.backdropRef();
    const dialog = this.dialogRef();
    if (!backdrop || !dialog) return;

    this.#backdropAnim?.cancel();
    this.#dialogAnim?.cancel();

    // Backdrop: fade in
    this.#backdropAnim = backdrop.nativeElement.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 250, easing: 'ease-out', fill: 'forwards' },
    );

    // Dialog: scale up + fade in
    this.#dialogAnim = dialog.nativeElement.animate(
      [
        { transform: 'scale(0.85) translateY(20px)', opacity: 0 },
        { transform: 'scale(1) translateY(0px)', opacity: 1 },
      ],
      {
        duration: 300,
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        fill: 'forwards',
      },
    );
  }

  #animateOut(): void {
    const backdrop = this.backdropRef();
    const dialog = this.dialogRef();
    if (!backdrop || !dialog) return;

    this.#backdropAnim?.cancel();
    this.#dialogAnim?.cancel();

    // Backdrop: fade out
    this.#backdropAnim = backdrop.nativeElement.animate(
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: 200, easing: 'ease-in', fill: 'forwards' },
    );

    // Dialog: scale down + fade out
    this.#dialogAnim = dialog.nativeElement.animate(
      [
        { transform: 'scale(1) translateY(0px)', opacity: 1 },
        { transform: 'scale(0.85) translateY(20px)', opacity: 0 },
      ],
      { duration: 200, easing: 'ease-in', fill: 'forwards' },
    );

    // Hide the overlay after the animation finishes.
    // Lynx doesn't fire animationend for JS animate API, so use a timeout
    // matched to the longest animation duration.
    setTimeout(() => this.overlayVisible.set(false), 220);
  }
}

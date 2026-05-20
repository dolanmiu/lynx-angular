import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <view style="padding: 24px;">
      <text style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">
        Overlay Element
      </text>

      <view
        style="background-color: #6200ee; padding: 12px 24px; border-radius: 8px; align-items: center;"
        (bindtap)="open()"
      >
        <text style="color: white; font-size: 16px;">Show Modal</text>
      </view>

      <overlay [attr.visible]="showModal()">
        <view
          style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.5); align-items: center; justify-content: center;"
          (bindtap)="close()"
        >
          <view
            style="background-color: white; padding: 24px; border-radius: 12px; width: 250px;"
            (catchtap)="noop()"
          >
            <text
              style="font-size: 18px; font-weight: bold; margin-bottom: 12px;"
            >
              Modal Title
            </text>
            <text style="font-size: 14px; color: #666; margin-bottom: 16px;">
              This overlay floats above the normal content.
            </text>
            <view
              style="background-color: #6200ee; padding: 10px 20px; border-radius: 8px; align-items: center;"
              (bindtap)="close()"
            >
              <text style="color: white; font-size: 14px;">Close</text>
            </view>
          </view>
        </view>
      </overlay>
    </view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class AppComponent {
  showModal = signal(false);

  open(): void {
    this.showModal.set(true);
  }

  close(): void {
    this.showModal.set(false);
  }

  // Catches tap to prevent it from reaching the backdrop
  noop(): void {}
}

import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="page" scroll-orientation="vertical">
      <view class="container">
        <text class="title">Overlay Element</text>
        <text class="subtitle">
          A floating layer for modals and popups.
        </text>

        <view class="btn" (bindtap)="open()">
          <text class="btn-text">Show Modal</text>
        </view>

        <overlay [attr.visible]="showModal()">
          <view class="backdrop" (bindtap)="close()">
            <view class="modal" (catchtap)="noop()">
              <text class="modal-title">Modal Title</text>
              <text class="modal-desc">
                This overlay floats above the normal content.
              </text>
              <view class="btn" (bindtap)="close()">
                <text class="btn-text">Close</text>
              </view>
            </view>
          </view>
        </overlay>
      </view>
    </scroll-view>
  `,
  styles: `
    .page { height: 100%; background-color: #fafafa; }
    .container { padding: 24px; }
    .title { font-size: 28px; font-weight: bold; color: #18181b; margin-bottom: 4px; }
    .subtitle { font-size: 13px; color: #71717a; margin-bottom: 20px; }
    .btn { background-color: #6366f1; padding: 12px 24px; border-radius: 10px; align-items: center; }
    .btn-text { color: white; font-size: 15px; font-weight: 600; }
    .backdrop { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.4); align-items: center; justify-content: center; }
    .modal { background-color: #ffffff; border: 1px solid #e4e4e7; padding: 24px; border-radius: 16px; width: 260px; align-items: center; }
    .modal-title { font-size: 18px; font-weight: bold; color: #18181b; margin-bottom: 8px; }
    .modal-desc { font-size: 14px; color: #71717a; margin-bottom: 20px; text-align: center; line-height: 20px; }
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
  readonly showModal = signal(false);

  open(): void {
    this.showModal.set(true);
  }

  close(): void {
    this.showModal.set(false);
  }

  // Catches tap to prevent it from reaching the backdrop
  noop(): void {}
}

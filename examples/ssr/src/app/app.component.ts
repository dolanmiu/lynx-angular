import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view style="flex: 1;" scroll-orientation="vertical">
      <view style="padding: 24px; align-items: center;">
        <text style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">
          SSR (Instant First-Frame Rendering)
        </text>

        <!-- SSR diagnostic panel -->
        <view
          style="padding: 16px; border-radius: 8px; margin-bottom: 16px; width: 100%;"
          [style.background-color]="ssrStatus().ok ? '#e8f5e9' : '#fbe9e7'"
        >
          <text style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">
            SSR Status
          </text>
          <text style="font-size: 13px; margin-bottom: 4px;">
            ssrEncode registered:
            {{ ssrStatus().encodeRegistered ? 'YES' : 'NO' }}
          </text>
          <text style="font-size: 13px; margin-bottom: 4px;">
            ssrHydrate registered:
            {{ ssrStatus().hydrateRegistered ? 'YES' : 'NO' }}
          </text>
          <text style="font-size: 13px; margin-bottom: 4px;">
            Opcode count: {{ ssrStatus().opcodeCount }}
          </text>
          <text style="font-size: 13px;">
            Snapshot size: {{ ssrStatus().snapshotSize }} bytes
          </text>
        </view>

        <!-- Tap to run ssrEncode and show the raw output -->
        <view
          style="background-color: #1565c0; padding: 12px 24px; border-radius: 8px; margin-bottom: 16px;"
          (bindtap)="runEncode()"
        >
          <text style="color: white; font-size: 16px;">Run ssrEncode()</text>
        </view>

        @if (snapshotPreview()) {
          <view
            style="background-color: #f5f5f5; padding: 12px; border-radius: 8px; margin-bottom: 16px; width: 100%;"
          >
            <text style="font-size: 12px; font-family: monospace; color: #333;">
              {{ snapshotPreview() }}
            </text>
          </view>
        }

        <view
          style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin-bottom: 16px;"
        >
          <text style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">
            Static content (rendered in snapshot)
          </text>
          <text style="font-size: 14px;">
            This text is part of the first-frame snapshot. It appears instantly
            without waiting for JS to execute on the background thread.
          </text>
        </view>

        @for (item of items(); track item.id) {
          <view
            style="padding: 12px; border-bottom-width: 1px; border-color: #eee;"
          >
            <text style="font-size: 14px;">{{ item.label }}</text>
          </view>
        }

        <view
          style="background-color: #6200ee; padding: 12px 24px; border-radius: 8px; margin-top: 16px;"
          (bindtap)="addItem()"
        >
          <text style="color: white; font-size: 16px;"
            >Add item (post-hydration)</text
          >
        </view>

        <text style="font-size: 12px; color: #999; margin-top: 16px;">
          Items added after hydration use normal element creation — the SSR
          snapshot only captures the initial render state.
        </text>
      </view>
    </scroll-view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class AppComponent {
  readonly items = signal([
    { id: 1, label: 'Item 1 — from initial data' },
    { id: 2, label: 'Item 2 — from initial data' },
    { id: 3, label: 'Item 3 — from initial data' },
  ]);

  readonly ssrStatus = signal(this.#checkSsrStatus());
  readonly snapshotPreview = signal('');

  #nextId = 4;

  addItem(): void {
    this.items.update((prev) => [
      ...prev,
      { id: this.#nextId, label: `Item ${this.#nextId} — added dynamically` },
    ]);
    this.#nextId++;
  }

  runEncode(): void {
    try {
      const ssrEncode = (globalThis as any).ssrEncode as
        | (() => string)
        | undefined;
      if (!ssrEncode) {
        this.snapshotPreview.set('ERROR: ssrEncode not registered');
        return;
      }
      const result = ssrEncode();
      const parsed = JSON.parse(result);
      const opcodeCount = parsed.__opcodes?.length ?? 0;

      this.ssrStatus.set({
        ...this.#checkSsrStatus(),
        opcodeCount,
        snapshotSize: result.length,
      });

      // Show a truncated preview of the snapshot JSON
      const preview =
        result.length > 500 ? `${result.slice(0, 500)}...` : result;
      this.snapshotPreview.set(preview);
    } catch (e) {
      this.snapshotPreview.set(`ERROR: ${e}`);
    }
  }

  #checkSsrStatus(): {
    ok: boolean;
    encodeRegistered: boolean;
    hydrateRegistered: boolean;
    opcodeCount: number;
    snapshotSize: number;
  } {
    const encodeRegistered =
      typeof (globalThis as any).ssrEncode === 'function';
    const hydrateRegistered =
      typeof (globalThis as any).ssrHydrate === 'function';
    return {
      ok: encodeRegistered && hydrateRegistered,
      encodeRegistered,
      hydrateRegistered,
      opcodeCount: 0,
      snapshotSize: 0,
    };
  }
}

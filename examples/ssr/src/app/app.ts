import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="page" scroll-orientation="vertical">
      <view class="container">
        <text class="title">SSR</text>
        <text class="subtitle">Instant first-frame rendering with snapshot encoding.</text>

        <!-- SSR diagnostic panel -->
        <view
          class="status-card"
          [class.status-ok]="ssrStatus().ok"
          [class.status-err]="!ssrStatus().ok"
        >
          <text class="status-title">SSR Status</text>
          <text class="status-line">
            ssrEncode registered:
            {{ ssrStatus().encodeRegistered ? 'YES' : 'NO' }}
          </text>
          <text class="status-line">
            ssrHydrate registered:
            {{ ssrStatus().hydrateRegistered ? 'YES' : 'NO' }}
          </text>
          <text class="status-line">
            Opcode count: {{ ssrStatus().opcodeCount }}
          </text>
          <text class="status-line">
            Snapshot size: {{ ssrStatus().snapshotSize }} bytes
          </text>
        </view>

        <view class="btn" (bindtap)="runEncode()">
          <text class="btn-text">Run ssrEncode()</text>
        </view>

        @if (snapshotPreview()) {
          <view class="code-card">
            <text class="code-text">{{ snapshotPreview() }}</text>
          </view>
        }

        <view class="card">
          <text class="section-label">Static Content</text>
          <text class="static-text">
            This text is part of the first-frame snapshot. It appears instantly
            without waiting for JS to execute on the background thread.
          </text>
        </view>

        <view class="card">
          <text class="section-label">Dynamic Items</text>
          @for (item of items(); track item.id) {
            <view class="item-row">
              <text class="item-text">{{ item.label }}</text>
            </view>
          }
          <view class="btn btn-sm" (bindtap)="addItem()">
            <text class="btn-text">Add item (post-hydration)</text>
          </view>
        </view>

        <text class="note">
          Items added after hydration use normal element creation — the SSR
          snapshot only captures the initial render state.
        </text>
      </view>
    </scroll-view>
  `,
  styles: `
    .page { height: 100%; background-color: #fafafa; }
    .container { padding: 24px; }
    .title { font-size: 28px; font-weight: bold; color: #18181b; margin-bottom: 4px; }
    .subtitle { font-size: 13px; color: #71717a; margin-bottom: 20px; }
    .status-card { border-radius: 12px; padding: 16px; margin-bottom: 16px; }
    .status-ok { background-color: #f0fdf4; border: 1px solid #bbf7d0; }
    .status-err { background-color: #fef2f2; border: 1px solid #fecaca; }
    .status-title { font-size: 14px; font-weight: 600; color: #18181b; margin-bottom: 8px; }
    .status-line { font-size: 13px; color: #71717a; margin-bottom: 2px; }
    .btn { background-color: #6366f1; padding: 12px 24px; border-radius: 10px; align-items: center; margin-bottom: 16px; }
    .btn-sm { margin-top: 12px; margin-bottom: 0; }
    .btn-text { color: white; font-size: 15px; font-weight: 600; }
    .code-card { background-color: #f4f4f5; border-radius: 8px; padding: 12px; margin-bottom: 16px; }
    .code-text { font-size: 11px; color: #18181b; }
    .card { background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
    .section-label { font-size: 11px; font-weight: 700; color: #a1a1aa; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    .static-text { font-size: 14px; color: #71717a; line-height: 20px; }
    .item-row { padding: 10px 0; border-bottom: 1px solid #e4e4e7; }
    .item-text { font-size: 14px; color: #18181b; }
    .note { font-size: 12px; color: #a1a1aa; }
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {
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

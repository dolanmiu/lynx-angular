import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="h-full bg-zinc-50" scroll-orientation="vertical">
      <view class="p-6">
        <text class="text-[28px] font-bold text-zinc-900 mb-1">SSR</text>
        <text class="text-[13px] text-zinc-500 mb-5"
          >Instant first-frame rendering with snapshot encoding.</text
        >

        <view
          class="rounded-xl p-4 mb-4 border"
          [class.bg-green-50]="ssrStatus().ok"
          [class.border-green-200]="ssrStatus().ok"
          [class.bg-red-50]="!ssrStatus().ok"
          [class.border-red-200]="!ssrStatus().ok"
        >
          <text class="text-sm font-semibold text-zinc-900 mb-2"
            >SSR Status</text
          >
          <text class="text-[13px] text-zinc-500 mb-0.5"
            >ssrEncode registered:
            {{ ssrStatus().encodeRegistered ? 'YES' : 'NO' }}</text
          >
          <text class="text-[13px] text-zinc-500 mb-0.5"
            >ssrHydrate registered:
            {{ ssrStatus().hydrateRegistered ? 'YES' : 'NO' }}</text
          >
          <text class="text-[13px] text-zinc-500 mb-0.5"
            >Opcode count: {{ ssrStatus().opcodeCount }}</text
          >
          <text class="text-[13px] text-zinc-500 mb-0.5"
            >Snapshot size: {{ ssrStatus().snapshotSize }} bytes</text
          >
        </view>

        <view
          class="bg-indigo-500 py-3 px-6 rounded-[10px] items-center mb-4"
          (bindtap)="runEncode()"
        >
          <text class="text-white text-[15px] font-semibold"
            >Run ssrEncode()</text
          >
        </view>

        @if (snapshotPreview()) {
          <view class="bg-zinc-100 rounded-lg p-3 mb-4">
            <text class="text-[11px] text-zinc-900">{{
              snapshotPreview()
            }}</text>
          </view>
        }

        <view class="bg-white border border-zinc-200 rounded-xl p-4 mb-4">
          <text
            class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-2.5"
            >Static Content</text
          >
          <text class="text-sm text-zinc-500 leading-5">
            This text is part of the first-frame snapshot. It appears instantly
            without waiting for JS to execute on the background thread.
          </text>
        </view>

        <view class="bg-white border border-zinc-200 rounded-xl p-4 mb-4">
          <text
            class="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5px] mb-2.5"
            >Dynamic Items</text
          >
          @for (item of items(); track item.id) {
            <view class="py-2.5 border-b border-zinc-200">
              <text class="text-sm text-zinc-900">{{ item.label }}</text>
            </view>
          }
          <view
            class="bg-indigo-500 py-3 px-6 rounded-[10px] items-center mt-3"
            (bindtap)="addItem()"
          >
            <text class="text-white text-[15px] font-semibold"
              >Add item (post-hydration)</text
            >
          </view>
        </view>

        <text class="text-xs text-zinc-400">
          Items added after hydration use normal element creation — the SSR
          snapshot only captures the initial render state.
        </text>
      </view>
    </scroll-view>
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

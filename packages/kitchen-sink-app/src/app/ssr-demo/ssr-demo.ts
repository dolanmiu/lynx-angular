import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-ssr-demo',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  templateUrl: './ssr-demo.html',
  styleUrl: './ssr-demo.css',
})
export class SsrDemo {
  readonly ssrStatus = signal(this.#checkStatus());
  readonly snapshotPreview = signal('');

  runEncode(): void {
    try {
      // `ssrEncode` is registered on globalThis by the renderer's SSR setup
      // (provideRenderer() with SSR enabled). It's on globalThis — not in DI —
      // because the SSR encode must be callable from outside Angular's injector:
      // the native host (test harness, CLI tool) invokes it after the Angular
      // app is bootstrapped but without access to the component tree.
      const ssrEncode = (globalThis as any).ssrEncode as
        | (() => string)
        | undefined;
      if (!ssrEncode) {
        this.snapshotPreview.set('ERROR: ssrEncode not registered');
        return;
      }
      const result = ssrEncode();
      const parsed = JSON.parse(result);
      const opcodeCount = (parsed.__opcodes?.length as number) ?? 0;

      this.ssrStatus.set({
        ...this.#checkStatus(),
        opcodeCount,
        snapshotSize: result.length,
      });

      const preview =
        result.length > 600 ? `${result.slice(0, 600)}...` : result;
      this.snapshotPreview.set(preview);
    } catch (e) {
      this.snapshotPreview.set(`ERROR: ${e}`);
    }
  }

  #checkStatus(): {
    ok: boolean;
    encodeRegistered: boolean;
    hydrateRegistered: boolean;
    opcodeCount: number;
    snapshotSize: number;
  } {
    // Both functions must be present for SSR to be operational: ssrEncode
    // serializes the initial render to an opcode snapshot, and ssrHydrate
    // replays that snapshot on the main thread before Angular hydrates.
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

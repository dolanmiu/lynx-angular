import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-ssr-demo',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  templateUrl: './ssr-demo.component.html',
  styleUrl: './ssr-demo.component.css',
})
export class SsrDemoComponent {
  readonly ssrStatus = signal(this.#checkStatus());
  readonly snapshotPreview = signal('');

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

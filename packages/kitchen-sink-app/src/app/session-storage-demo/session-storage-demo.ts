import { Component, inject, signal } from '@angular/core';
import { LYNX_ELEMENTS, LynxSessionStorage } from '@blotch/angular-lynx';

@Component({
  selector: 'app-session-storage-demo',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  templateUrl: './session-storage-demo.html',
  styleUrl: './session-storage-demo.css',
})
export class SessionStorageDemo {
  readonly #sessionStorage = inject(LynxSessionStorage);

  // Reactive signal that auto-updates when any LynxView writes to "counter"
  readonly counter = this.#sessionStorage.watch<number>('counter');

  // One-shot read result
  readonly lastRead = signal<string>('(not yet read)');

  // Track write count for display
  readonly writeCount = signal(0);

  increment(): void {
    const current = this.counter() ?? 0;
    this.#sessionStorage.setItem('counter', current + 1);
    this.writeCount.update((v) => v + 1);
  }

  reset(): void {
    this.#sessionStorage.setItem('counter', 0);
    this.writeCount.update((v) => v + 1);
  }

  async readOnce(): Promise<void> {
    try {
      const value = await this.#sessionStorage.getItem<number>('counter');
      this.lastRead.set(`counter = ${value ?? 'undefined'}`);
    } catch {
      this.lastRead.set('(not available in this environment)');
    }
  }
}

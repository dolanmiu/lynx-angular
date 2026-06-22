import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-defer-demo',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  templateUrl: './defer-demo.html',
  styleUrl: './defer-demo.css',
})
export class DeferDemo {
  readonly deferredVisible = signal(false);

  showDeferred(): void {
    // setTimeout defers the signal update out of the native `bindtap` callback.
    // Directly updating a signal inside a Lynx native event handler can cause
    // the renderer to flush while the native event is still on the call stack,
    // which conflicts with Lynx's main-thread frame pipeline.
    setTimeout(() => this.deferredVisible.set(true), 0);
  }
}

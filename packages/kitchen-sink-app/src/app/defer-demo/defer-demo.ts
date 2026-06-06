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
    setTimeout(() => this.deferredVisible.set(true), 0);
  }
}

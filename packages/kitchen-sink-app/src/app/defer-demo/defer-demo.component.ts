import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-defer-demo',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  templateUrl: './defer-demo.component.html',
  styleUrl: './defer-demo.component.css',
})
export class DeferDemoComponent {
  readonly deferredVisible = signal(false);

  showDeferred(): void {
    setTimeout(() => this.deferredVisible.set(true), 0);
  }
}

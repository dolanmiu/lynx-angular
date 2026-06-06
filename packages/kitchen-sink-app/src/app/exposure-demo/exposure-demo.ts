import { Component, computed, inject, signal } from '@angular/core';
import {
  LYNX_ELEMENTS,
  LynxExposure,
  LynxGlobalExposure,
} from '@blotch/angular-lynx';

@Component({
  selector: 'app-exposure-demo',
  standalone: true,
  imports: [LYNX_ELEMENTS, LynxExposure],
  templateUrl: './exposure-demo.html',
  styleUrl: './exposure-demo.css',
})
export class ExposureDemo {
  readonly #exposureService = inject(LynxGlobalExposure);

  // Directive-based: per-element visibility tracking
  readonly itemLabels = ['Item A', 'Item B', 'Item C', 'Item D', 'Item E'];

  // Service-based: global exposure events
  readonly exposures = this.#exposureService.exposures;
  readonly disexposures = this.#exposureService.disexposures;
  readonly active = this.#exposureService.active;

  readonly lastExposureCount = computed(() => this.exposures().length);
  readonly lastDisexposureCount = computed(() => this.disexposures().length);

  // Track which exposure-ids were last reported
  readonly lastExposedIds = computed(() =>
    this.exposures()
      .map((e) => e.exposureID)
      .join(', '),
  );

  // Pause/resume counter so the user can see the effect
  readonly toggleCount = signal(0);

  toggleExposure(): void {
    if (this.active()) {
      this.#exposureService.stopExposure({ sendEvent: false });
    } else {
      this.#exposureService.resumeExposure();
    }
    this.toggleCount.update((v) => v + 1);
  }
}

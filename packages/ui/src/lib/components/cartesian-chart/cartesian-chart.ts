import { Component, ViewEncapsulation, computed, input } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

import { cn } from '../../utils/cn';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single data point in cartesian (x, y) space. */
export type ChartPoint = { x: number; y: number };

/** An inclusive `[min, max]` value range for one axis. */
export type ChartDomain = readonly [number, number];

/** Maps a data value on one axis to a pixel offset inside the plot area. */
export type ChartScale = (value: number) => number;

// ---------------------------------------------------------------------------
// Pure geometry (exported so it can be unit-tested without Angular)
// ---------------------------------------------------------------------------

/**
 * Builds a linear interpolation function from a data `domain` to a pixel
 * `range`. The range is allowed to be *descending* (`[height, 0]`) — that is how
 * the y-axis is flipped so that larger data values render higher up the screen
 * (screen y grows downward).
 *
 * A zero-width domain (all values equal) would divide by zero, so it collapses
 * to the range midpoint — the flat line then sits centred in the plot.
 */
export const linearScale = (
  domain: ChartDomain,
  range: readonly [number, number],
): ChartScale => {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0;
  if (span === 0) {
    const mid = (r0 + r1) / 2;
    return () => mid;
  }
  return (value: number) => r0 + ((value - d0) / span) * (r1 - r0);
};

/**
 * Rounds a number to a "nice" one — a `1`, `2`, `5`, or `10` times a power of
 * ten. This is the Heckbert "nice numbers for graph labels" primitive: it makes
 * axis steps read as `0, 25, 50, 75, 100` rather than `0, 24.25, 48.5, …`.
 *
 * We compute the magnitude with `Math.log(x) / Math.LN10` rather than
 * `Math.log10` — the latter is a runtime method the Lynx build pipeline does
 * NOT polyfill (same class of gap as `String.prototype.replaceAll`), whereas
 * `Math.log`/`Math.LN10` are ES5 and always present.
 *
 * @param round when `true`, snap to the nearest nice number; when `false`, take
 *   the smallest nice number ≥ `value` (used to size the whole range).
 */
export const niceNum = (value: number, round: boolean): number => {
  if (value <= 0) return 0;
  const exponent = Math.floor(Math.log(value) / Math.LN10);
  const fraction = value / Math.pow(10, exponent); // in [1, 10)
  let niceFraction: number;
  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else {
    if (fraction <= 1) niceFraction = 1;
    else if (fraction <= 2) niceFraction = 2;
    else if (fraction <= 5) niceFraction = 5;
    else niceFraction = 10;
  }
  return niceFraction * Math.pow(10, exponent);
};

/**
 * Derives a rounded axis from raw data extremes: a padded `[lo, hi]` domain
 * plus evenly stepped, human-readable `ticks`. `tickCount` is a *target* — the
 * actual tick count can differ by one because the step is snapped to a nice
 * value (this is standard axis behaviour, e.g. D3's `ticks`).
 *
 * Flat data (`min === max`) or non-finite input can't yield a range, so we pad
 * around the single value to keep the line visible mid-plot.
 */
export const niceScale = (
  min: number,
  max: number,
  tickCount = 5,
): { domain: ChartDomain; ticks: number[]; step: number } => {
  let lo0 = min;
  let hi0 = max;
  if (!Number.isFinite(lo0) || !Number.isFinite(hi0) || lo0 === hi0) {
    const base = Number.isFinite(lo0) ? lo0 : 0;
    const pad = base === 0 ? 1 : Math.abs(base) * 0.5;
    lo0 = base - pad;
    hi0 = base + pad;
  }

  const range = niceNum(hi0 - lo0, false);
  const step = niceNum(range / Math.max(1, tickCount - 1), true);
  const lo = Math.floor(lo0 / step) * step;
  const hi = Math.ceil(hi0 / step) * step;

  const ticks: number[] = [];
  // Step to `hi` inclusive; the half-step slack absorbs floating-point drift so
  // the final tick isn't dropped. Snapping each value to the step grid clears
  // accumulated error (e.g. 0.30000000000000004 → 0.3).
  for (let v = lo; v <= hi + step * 0.5; v += step) {
    ticks.push(Math.round(v / step) * step);
  }

  return { domain: [lo, hi], ticks, step };
};

/**
 * Evenly divides a `domain` into exactly `count` tick values (endpoints
 * included). Used as the fallback when a caller hasn't supplied explicit ticks
 * — `niceScale` is preferred when human-readable labels matter.
 */
export const generateTicks = (domain: ChartDomain, count: number): number[] => {
  const [d0, d1] = domain;
  if (count <= 1) return [d0];
  const ticks: number[] = [];
  for (let i = 0; i < count; i++) {
    ticks.push(d0 + ((d1 - d0) * i) / (count - 1));
  }
  return ticks;
};

// ---------------------------------------------------------------------------
// Rendering helpers
// ---------------------------------------------------------------------------

/**
 * Formats a pixel value for an inline style string. Two decimals keeps
 * sub-pixel precision for rotated segments while avoiding scientific notation
 * (`1e-7px`), which Lynx's CSS parser would reject.
 */
const px = (n: number): string => `${n.toFixed(2)}px`;

/**
 * Default axis label formatter — plain JS only (no `Intl`, absent in Lynx).
 */
const defaultTickFormat = (value: number): string =>
  String(Math.round(value * 100) / 100);

// Small pixel constants for label placement. Font is 10px; offsetting a y-label
// by half that vertically-centres it on its gridline.
const LABEL_FONT_HALF = 5;
const LABEL_GUTTER_GAP = 6;
const X_LABEL_WIDTH = 44;
const X_LABEL_GAP = 4;

/**
 * The reusable foundation for cartesian (x/y) charts — line, bar, scatter, …
 *
 * It draws the *frame* (horizontal gridlines + axis tick labels) and hosts a
 * definite-size **plot area** into which chart marks are projected via
 * `<ng-content>`. It carries no marks of its own; series components
 * (`<ui-line-series>`, and future `<ui-bar-series>` etc.) `inject()` this class
 * to read the shared `xScale`/`yScale`/`plotWidth`/`plotHeight` and draw
 * themselves. This mirrors the `UiToggleGroup` / `UiToggleGroupItem` DI pattern.
 *
 * ## Why explicit pixel `width`/`height`
 * A line is drawn as rotated `<view>` segments (Lynx has no SVG/`<line>`), and
 * the rotation angle/length can only be computed from *pixel* coordinates. So
 * the chart is sized in explicit px rather than stretching responsively.
 *
 * ## Why absolute positioning works here
 * Lynx has no `position: static` — every element is `position: relative` and an
 * absolute child resolves against its **direct parent**, not a distant
 * ancestor. So the plot area is a definite-size box and every mark must be a
 * direct child of it (or of a series host sized to fill it — see UiLineSeries).
 */
@Component({
  selector: 'ui-cartesian-chart',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  encapsulation: ViewEncapsulation.None,
  template: `
    <view [class]="containerClass()" [style]="containerStyle()">
      <!--
        Plot area: a definite-size box, offset by the y-axis gutter. It is the
        containing block for both the gridlines and the projected series marks.
        Gridlines render BEFORE <ng-content> so the line paints on top of them
        (Lynx paint order follows source order; z-index is not needed).
      -->
      <view [style]="plotStyle()">
        @if (showGrid()) {
          @for (line of gridlines(); track $index) {
            <view class="bg-border" [style]="line.style"></view>
          }
        }
        <ng-content />
      </view>

      <!-- Y-axis tick labels, right-aligned in the gutter beside the plot. -->
      @for (label of yLabels(); track $index) {
        <text
          class="text-[10px] leading-none text-muted-foreground text-right"
          [style]="label.style"
          >{{ label.text }}</text
        >
      }

      <!-- X-axis tick labels, centred under each tick below the plot. -->
      @for (label of xLabels(); track $index) {
        <text
          class="text-[10px] leading-none text-muted-foreground text-center"
          [style]="label.style"
          >{{ label.text }}</text
        >
      }
    </view>
  `,
})
export class UiCartesianChart {
  readonly xDomain = input<ChartDomain>([0, 1]);
  readonly yDomain = input<ChartDomain>([0, 1]);
  /** Explicit tick values. When omitted, ticks are evenly generated. */
  readonly xTicks = input<number[] | undefined>(undefined);
  readonly yTicks = input<number[] | undefined>(undefined);
  readonly width = input(320);
  readonly height = input(200);
  readonly yAxisWidth = input(32);
  readonly xAxisHeight = input(20);
  readonly tickCount = input(5);
  readonly showGrid = input(true);
  readonly xTickFormat = input<(value: number) => string>(defaultTickFormat);
  readonly yTickFormat = input<(value: number) => string>(defaultTickFormat);
  readonly userClass = input<string>('', { alias: 'class' });

  // --- Shared coordinate system (read by projected series via DI) ---

  readonly plotWidth = computed(() => this.width() - this.yAxisWidth());
  readonly plotHeight = computed(() => this.height() - this.xAxisHeight());

  readonly xScale = computed<ChartScale>(() =>
    linearScale(this.xDomain(), [0, this.plotWidth()]),
  );
  // Range is flipped ([height, 0]) so larger y-values sit higher up the plot.
  readonly yScale = computed<ChartScale>(() =>
    linearScale(this.yDomain(), [this.plotHeight(), 0]),
  );

  // --- Internal rendering state ---

  readonly #resolvedYTicks = computed(
    () => this.yTicks() ?? generateTicks(this.yDomain(), this.tickCount()),
  );
  readonly #resolvedXTicks = computed(
    () => this.xTicks() ?? generateTicks(this.xDomain(), this.tickCount()),
  );

  protected readonly containerClass = computed(() => cn(this.userClass()));

  // `flex-shrink: 0` stops a narrow parent squeezing the chart below its
  // explicit pixel width (Lynx lets flex items shrink past their content).
  protected readonly containerStyle = computed(
    () =>
      `position: relative; width: ${px(this.width())}; height: ${px(this.height())}; flex-shrink: 0;`,
  );

  protected readonly plotStyle = computed(
    () =>
      `position: absolute; left: ${px(this.yAxisWidth())}; top: 0px; width: ${px(this.plotWidth())}; height: ${px(this.plotHeight())};`,
  );

  protected readonly gridlines = computed(() => {
    const scale = this.yScale();
    return this.#resolvedYTicks().map((value) => ({
      style: `position: absolute; left: 0px; top: ${px(scale(value))}; width: 100%; height: 1px;`,
    }));
  });

  protected readonly yLabels = computed(() => {
    const scale = this.yScale();
    const format = this.yTickFormat();
    const width = this.yAxisWidth() - LABEL_GUTTER_GAP;
    return this.#resolvedYTicks().map((value) => ({
      text: format(value),
      style: `position: absolute; left: 0px; top: ${px(scale(value) - LABEL_FONT_HALF)}; width: ${px(width)};`,
    }));
  });

  protected readonly xLabels = computed(() => {
    const scale = this.xScale();
    const format = this.xTickFormat();
    const gutter = this.yAxisWidth();
    const top = this.plotHeight() + X_LABEL_GAP;
    return this.#resolvedXTicks().map((value) => ({
      text: format(value),
      style: `position: absolute; top: ${px(top)}; left: ${px(gutter + scale(value) - X_LABEL_WIDTH / 2)}; width: ${px(X_LABEL_WIDTH)};`,
    }));
  });
}

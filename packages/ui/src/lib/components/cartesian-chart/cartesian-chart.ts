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

/**
 * Inner inset applied to the plot area, one value per side as a **fraction**
 * (`0`–`1`) of the plot's width/height. It shrinks the range the scales map into,
 * so every projected series is pushed clear of the frame at once — the common use
 * is keeping the first/last dot from sitting flush against the axis. Fractions
 * (not pixels) keep the inset proportional as the chart is resized. Omitted sides
 * default to `0`.
 */
export type ChartPadding = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

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

/**
 * Resamples a polyline into a dense run of points that trace a smooth
 * **monotone cubic** curve through the originals — the shared smoothing
 * primitive both the line and the area series build on so that "smooth" behaves
 * identically for either.
 *
 * ## Why monotone cubic (Fritsch–Carlson), not Catmull-Rom
 * A monotone cubic never overshoots its data: between two points the curve stays
 * inside their y-range, so a smoothed line never bulges past a peak and a
 * smoothed area fill never pokes above the plot or dips below its baseline. That
 * matters here because the axis domain is derived from the *raw* data extremes —
 * an overshooting curve (which Catmull-Rom produces) would render outside the
 * plot and clip. This is the same curve D3 draws for `curveMonotoneX` and the
 * default Recharts `type="monotone"`.
 *
 * ## Why resample instead of emitting a path
 * Lynx has no SVG path: a line is drawn as many short rotated `<view>` segments
 * and an area as sampled column heights. So rather than describe the curve, we
 * return closely-spaced points *on* it, and each caller rasterizes them with the
 * exact same code it already uses for raw data (`computeLineSegments` /
 * `computeAreaColumns`). "Smooth" then costs nothing but a denser point set.
 *
 * Points must be sorted ascending by x (as cartesian data always is). Fewer than
 * three points can't define a curve — two already draw a single straight
 * segment — so they're returned unchanged. `samplesPerSegment` is how many
 * straight chords approximate each original segment; higher is smoother but emits
 * proportionally more native views.
 */
export const sampleSmoothLine = (
  points: readonly ChartPoint[],
  samplesPerSegment = 12,
): ChartPoint[] => {
  const n = points.length;
  if (n < 3) return points.map((p) => ({ x: p.x, y: p.y }));

  // Secant slope between each consecutive pair. A zero-width x-gap (duplicate x)
  // has no defined slope, so treat it as flat to avoid dividing by zero — the
  // sampler then draws a near-vertical chord across the repeated x.
  const secants: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    secants.push(dx === 0 ? 0 : (points[i + 1].y - points[i].y) / dx);
  }

  // Tangent at each point. Endpoints borrow their single adjacent secant;
  // interior points average their two neighbours, but a sign change (a local
  // peak or trough) forces a flat tangent so the curve turns without overshoot.
  const tangents: number[] = Array.from({ length: n });
  tangents[0] = secants[0];
  tangents[n - 1] = secants[n - 2];
  for (let i = 1; i < n - 1; i++) {
    const prev = secants[i - 1];
    const next = secants[i];
    tangents[i] = prev * next <= 0 ? 0 : (prev + next) / 2;
  }

  // Fritsch–Carlson monotonicity fix: keep each Hermite segment monotone by
  // clamping the tangents. Normalise them by the secant into (alpha, beta); if
  // that point falls outside a circle of radius 3, scale both back onto it. A
  // flat secant (equal endpoints) can't be normalised, so its tangents are
  // pinned to 0 instead.
  for (let i = 0; i < n - 1; i++) {
    const secant = secants[i];
    if (secant === 0) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
      continue;
    }
    const alpha = tangents[i] / secant;
    const beta = tangents[i + 1] / secant;
    const magnitude = alpha * alpha + beta * beta;
    if (magnitude > 9) {
      const scale = 3 / Math.sqrt(magnitude);
      tangents[i] = scale * alpha * secant;
      tangents[i + 1] = scale * beta * secant;
    }
  }

  // Evaluate the cubic Hermite spline on each segment. Sampling `t` from 0
  // (inclusive) up to — but not including — 1 hits every original point exactly
  // once via the next segment's t=0; the very last point is appended at the end.
  const samples = Math.max(1, samplesPerSegment);
  const out: ChartPoint[] = [];
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const h = p1.x - p0.x;
    const m0 = tangents[i];
    const m1 = tangents[i + 1];
    for (let s = 0; s < samples; s++) {
      const t = s / samples;
      const t2 = t * t;
      const t3 = t2 * t;
      // Hermite basis functions for value (h00, h01) and tangent (h10, h11).
      const h00 = 2 * t3 - 3 * t2 + 1;
      const h10 = t3 - 2 * t2 + t;
      const h01 = -2 * t3 + 3 * t2;
      const h11 = t3 - t2;
      out.push({
        x: p0.x + t * h,
        y: h00 * p0.y + h10 * h * m0 + h01 * p1.y + h11 * h * m1,
      });
    }
  }
  out.push({ x: points[n - 1].x, y: points[n - 1].y });
  return out;
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

// Extra gutter reserved when an axis *title* is set: a strip to the left of the
// y tick-labels for the (rotated) y-title, and a band below the x tick-labels for
// the x-title. 16px comfortably fits the 10px title font plus its line box.
const Y_AXIS_LABEL_SPACE = 16;
const X_AXIS_LABEL_SPACE = 16;
// Approximate line box of the 10px title font — used to size the rotated y-title.
const AXIS_LABEL_LINE_HEIGHT = 12;

/**
 * The reusable foundation for cartesian (x/y) charts — line, bar, scatter, …
 *
 * It draws the *frame* — horizontal (and optional vertical) gridlines, axis tick
 * labels, and optional axis titles — and hosts a definite-size **plot area** into
 * which chart marks are projected via `<ng-content>`. Inner `padding` insets the
 * shared scales so every series clears the frame at once. It carries no marks of
 * its own; series components
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
        @if (showXGrid()) {
          @for (line of verticalGridlines(); track $index) {
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

      <!-- Y-axis title: rotated -90° in the reserved left strip, centred on the
           plot height. Rendered only when set so it costs no gutter otherwise. -->
      @if (yAxisLabel()) {
        <text
          class="text-[10px] font-medium leading-none text-muted-foreground text-center"
          [style]="yAxisLabelStyle()"
          >{{ yAxisLabel() }}</text
        >
      }

      <!-- X-axis title: centred across the plot, below the x tick labels. -->
      @if (xAxisLabel()) {
        <text
          class="text-[10px] font-medium leading-none text-muted-foreground text-center"
          [style]="xAxisLabelStyle()"
          >{{ xAxisLabel() }}</text
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
  /** Draw horizontal gridlines at each y tick. */
  readonly showGrid = input(true);
  /** Draw vertical gridlines at each x tick (off by default — the y gridlines
   * above are the usual value reference for line/area charts). */
  readonly showXGrid = input(false);
  /** Title drawn along the x-axis, centred below the tick labels. */
  readonly xAxisLabel = input<string>('');
  /** Title drawn along the y-axis, rotated in the left gutter. */
  readonly yAxisLabel = input<string>('');
  /** Inner inset of the plot area, each side a fraction (0–1) — see {@link ChartPadding}. */
  readonly padding = input<ChartPadding>({});
  readonly xTickFormat = input<(value: number) => string>(defaultTickFormat);
  readonly yTickFormat = input<(value: number) => string>(defaultTickFormat);
  readonly userClass = input<string>('', { alias: 'class' });

  // --- Shared coordinate system (read by projected series via DI) ---

  // A set axis title steals a strip of the gutter (left for y, bottom for x);
  // absorbing it here shrinks the plot so titles never overlap the tick labels.
  readonly #yGutter = computed(
    () => this.yAxisWidth() + (this.yAxisLabel() ? Y_AXIS_LABEL_SPACE : 0),
  );
  readonly #xGutter = computed(
    () => this.xAxisHeight() + (this.xAxisLabel() ? X_AXIS_LABEL_SPACE : 0),
  );

  readonly plotWidth = computed(() => this.width() - this.#yGutter());
  readonly plotHeight = computed(() => this.height() - this.#xGutter());

  // Padding as pixels, resolved against the plot size. Omitted sides read as 0.
  readonly #padLeft = computed(
    () => (this.padding().left ?? 0) * this.plotWidth(),
  );
  readonly #padRight = computed(
    () => (this.padding().right ?? 0) * this.plotWidth(),
  );
  readonly #padTop = computed(
    () => (this.padding().top ?? 0) * this.plotHeight(),
  );
  readonly #padBottom = computed(
    () => (this.padding().bottom ?? 0) * this.plotHeight(),
  );

  // Scales map the domain into the *padded* range, so every projected series is
  // inset from the frame together — no per-series padding needed.
  readonly xScale = computed<ChartScale>(() =>
    linearScale(this.xDomain(), [
      this.#padLeft(),
      this.plotWidth() - this.#padRight(),
    ]),
  );
  // Range is flipped (high px → low px) so larger y-values sit higher up the plot.
  readonly yScale = computed<ChartScale>(() =>
    linearScale(this.yDomain(), [
      this.plotHeight() - this.#padBottom(),
      this.#padTop(),
    ]),
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
      `position: absolute; left: ${px(this.#yGutter())}; top: 0px; width: ${px(this.plotWidth())}; height: ${px(this.plotHeight())};`,
  );

  // Horizontal gridlines: full-width rules at each y tick's pixel height.
  protected readonly gridlines = computed(() => {
    const scale = this.yScale();
    return this.#resolvedYTicks().map((value) => ({
      style: `position: absolute; left: 0px; top: ${px(scale(value))}; width: 100%; height: 1px;`,
    }));
  });

  // Vertical gridlines: full-height rules at each x tick's pixel position.
  protected readonly verticalGridlines = computed(() => {
    const scale = this.xScale();
    return this.#resolvedXTicks().map((value) => ({
      style: `position: absolute; top: 0px; left: ${px(scale(value))}; width: 1px; height: 100%;`,
    }));
  });

  protected readonly yLabels = computed(() => {
    const scale = this.yScale();
    const format = this.yTickFormat();
    // A y-title pushes the tick labels right, past its reserved strip.
    const left = this.yAxisLabel() ? Y_AXIS_LABEL_SPACE : 0;
    const width = this.yAxisWidth() - LABEL_GUTTER_GAP;
    return this.#resolvedYTicks().map((value) => ({
      text: format(value),
      style: `position: absolute; left: ${px(left)}; top: ${px(scale(value) - LABEL_FONT_HALF)}; width: ${px(width)};`,
    }));
  });

  protected readonly xLabels = computed(() => {
    const scale = this.xScale();
    const format = this.xTickFormat();
    const gutter = this.#yGutter();
    const top = this.plotHeight() + X_LABEL_GAP;
    return this.#resolvedXTicks().map((value) => ({
      text: format(value),
      style: `position: absolute; top: ${px(top)}; left: ${px(gutter + scale(value) - X_LABEL_WIDTH / 2)}; width: ${px(X_LABEL_WIDTH)};`,
    }));
  });

  // Y-title: a horizontal text box `plotHeight` wide, rotated -90° about its
  // centre so it runs vertically. Rotation is visual only (it doesn't change the
  // layout box), so we position the *unrotated* box centred on the reserved left
  // strip and the plot's mid-height; after the turn it spans the full plot height.
  protected readonly yAxisLabelStyle = computed(() => {
    const h = this.plotHeight();
    const centreX = Y_AXIS_LABEL_SPACE / 2;
    const centreY = h / 2;
    const left = centreX - h / 2;
    const top = centreY - AXIS_LABEL_LINE_HEIGHT / 2;
    return (
      `position: absolute; left: ${px(left)}; top: ${px(top)}; ` +
      `width: ${px(h)}; height: ${px(AXIS_LABEL_LINE_HEIGHT)}; ` +
      `transform-origin: center; transform: rotate(-90deg);`
    );
  });

  // X-title: centred across the plot, in the band below the x tick labels.
  protected readonly xAxisLabelStyle = computed(
    () =>
      `position: absolute; left: ${px(this.#yGutter())}; top: ${px(this.plotHeight() + this.xAxisHeight())}; width: ${px(this.plotWidth())};`,
  );
}

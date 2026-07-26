import { describe, expect, it, vi } from 'vitest';

// Mock Angular so importing the component module doesn't require the framework
// runtime. Only the exported pure geometry fns are exercised here; the class
// field initializers (input/computed) never run because we never construct the
// component.
vi.mock('@angular/core', () => ({
  Component: () => () => {},
  ViewEncapsulation: { None: 0 },
  computed: () => () => {},
  input: () => () => {},
}));

vi.mock('@blotch/angular-lynx', () => ({
  LYNX_ELEMENTS: [],
}));

const { linearScale, niceNum, niceScale, generateTicks, sampleSmoothLine } =
  await import('./cartesian-chart');

describe('linearScale', () => {
  it('interpolates a value across the range', () => {
    const scale = linearScale([0, 10], [0, 100]);
    expect(scale(0)).toBe(0);
    expect(scale(5)).toBe(50);
    expect(scale(10)).toBe(100);
  });

  it('supports a descending range (flipped y-axis)', () => {
    const scale = linearScale([0, 100], [180, 0]);
    expect(scale(0)).toBe(180);
    expect(scale(50)).toBe(90);
    expect(scale(100)).toBe(0);
  });

  it('collapses a zero-width domain to the range midpoint', () => {
    const scale = linearScale([5, 5], [0, 200]);
    expect(scale(5)).toBe(100);
    expect(scale(999)).toBe(100);
  });
});

describe('niceNum', () => {
  it('rounds a range up to a nice number', () => {
    expect(niceNum(97, false)).toBe(100);
    expect(niceNum(85, false)).toBe(100);
    expect(niceNum(10, false)).toBe(10);
  });

  it('snaps a step to the nearest nice number', () => {
    expect(niceNum(25, true)).toBe(20);
    expect(niceNum(20, true)).toBe(20);
    expect(niceNum(2, true)).toBe(2);
  });

  it('returns 0 for non-positive input', () => {
    expect(niceNum(0, true)).toBe(0);
    expect(niceNum(-5, false)).toBe(0);
  });
});

describe('niceScale', () => {
  it('produces a rounded domain that contains the data', () => {
    const { domain } = niceScale(3, 88, 5);
    expect(domain[0]).toBeLessThanOrEqual(3);
    expect(domain[1]).toBeGreaterThanOrEqual(88);
  });

  it('generates ticks that span the domain endpoints', () => {
    const { domain, ticks, step } = niceScale(0, 100, 5);
    expect(step).toBeGreaterThan(0);
    expect(ticks[0]).toBe(domain[0]);
    expect(ticks[ticks.length - 1]).toBe(domain[1]);
    for (const tick of ticks) {
      expect(tick).toBeGreaterThanOrEqual(domain[0]);
      expect(tick).toBeLessThanOrEqual(domain[1]);
    }
  });

  it('pads flat data around the single value', () => {
    const { domain } = niceScale(5, 5, 5);
    expect(domain[0]).toBeLessThan(5);
    expect(domain[1]).toBeGreaterThan(5);
    expect(Number.isFinite(domain[0])).toBe(true);
    expect(Number.isFinite(domain[1])).toBe(true);
  });
});

describe('generateTicks', () => {
  it('evenly divides a domain into count ticks', () => {
    expect(generateTicks([0, 10], 5)).toEqual([0, 2.5, 5, 7.5, 10]);
    expect(generateTicks([0, 100], 3)).toEqual([0, 50, 100]);
  });

  it('returns a single tick when count is 1', () => {
    expect(generateTicks([0, 10], 1)).toEqual([0]);
  });
});

describe('sampleSmoothLine', () => {
  it('returns fewer-than-three points unchanged (no curve possible)', () => {
    expect(sampleSmoothLine([])).toEqual([]);
    expect(sampleSmoothLine([{ x: 1, y: 2 }])).toEqual([{ x: 1, y: 2 }]);
    expect(
      sampleSmoothLine([
        { x: 0, y: 0 },
        { x: 10, y: 5 },
      ]),
    ).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 5 },
    ]);
  });

  it('passes exactly through every original data point', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 8 },
      { x: 2, y: 3 },
      { x: 3, y: 10 },
    ];
    const curve = sampleSmoothLine(points, 8);
    for (const p of points) {
      const hit = curve.find((c) => Math.abs(c.x - p.x) < 1e-9);
      expect(hit).toBeDefined();
      expect(hit?.y).toBeCloseTo(p.y);
    }
  });

  it('keeps a straight line straight (collinear points do not bow)', () => {
    // y = 2x sampled at the curve's x values must stay on the line.
    const curve = sampleSmoothLine(
      [
        { x: 0, y: 0 },
        { x: 5, y: 10 },
        { x: 10, y: 20 },
      ],
      6,
    );
    for (const c of curve) {
      expect(c.y).toBeCloseTo(c.x * 2);
    }
  });

  it('never overshoots the data range (monotone: no bulge past a peak)', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 10 },
      { x: 2, y: 10 },
      { x: 3, y: 0 },
    ];
    const curve = sampleSmoothLine(points, 16);
    const ys = curve.map((c) => c.y);
    // The plateau at 10 is the max and 0 the min — a monotone cubic must stay
    // inside them (Catmull-Rom would overshoot above 10 approaching the plateau).
    expect(Math.max(...ys)).toBeLessThanOrEqual(10 + 1e-9);
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(0 - 1e-9);
  });

  it('emits a denser, x-ascending point set', () => {
    const curve = sampleSmoothLine(
      [
        { x: 0, y: 0 },
        { x: 1, y: 5 },
        { x: 2, y: 2 },
      ],
      10,
    );
    // 2 segments × 10 samples + 1 closing point.
    expect(curve).toHaveLength(21);
    for (let i = 1; i < curve.length; i++) {
      expect(curve[i].x).toBeGreaterThanOrEqual(curve[i - 1].x);
    }
  });
});

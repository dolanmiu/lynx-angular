import {
  fireEvent,
  getQueriesForElement,
} from '@blotch/angular-lynx-testing-library';
import { afterEach, describe, expect, it } from 'vitest';
import { renderOnce } from '../../test-utils/render-once';
import { MotionDemo } from './motion-demo';

// This demo renders <ui-icon>, whose `name` is a required input(). The shared
// render() helper's extra appRef.tick() trips an Angular 22 zoneless-JIT bug
// that resets that required input to undefined mid-render, crashing UiIcon.
// renderOnce() bootstraps with a single tick and avoids it (see
// src/test-utils/render-once.ts and events-demo.spec.ts).
let destroyDemo: (() => void) | null = null;

afterEach(() => {
  destroyDemo?.();
  destroyDemo = null;
});

/**
 * Every handler defers its signal write via setTimeout(0) (see the class doc),
 * so tests flush a macrotask before asserting on the resulting state.
 */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('MotionDemo', () => {
  it('renders all section titles', async () => {
    const { container, destroy } = await renderOnce(MotionDemo);
    destroyDemo = destroy;

    // Assert on titles this component renders itself (literal ng-content). The
    // <app-demo-screen> heading is input()-bound and doesn't render under the
    // JIT test pipeline — it renders only in the AOT app.
    const text = container.textContent ?? '';
    expect(text).toContain('CSS Transitions');
    expect(text).toContain('Keyframe Animations');
    expect(text).toContain('JS Animate API');
    expect(text).toContain('How it works');
  });

  it('exposes the four keyframe presets that drive the grid', async () => {
    const { instance, container, destroy } = await renderOnce(MotionDemo);
    destroyDemo = destroy;

    // The presets are model-driven; the first tile renders in the DOM here,
    // proving the @for mounts. (The single-tick test harness doesn't reliably
    // expand every @for row — see list-example.spec — so the remaining tiles
    // are asserted through the model, which is what drives the AOT render.)
    expect(container.textContent ?? '').toContain('Spin');
    expect(instance.keyframeTiles.map((t) => t.label)).toEqual([
      'Spin',
      'Pulse',
      'Bounce',
      'Shake',
    ]);
  });

  it('starts with the switch off and no keyframes active', async () => {
    const { instance, destroy } = await renderOnce(MotionDemo);
    destroyDemo = destroy;

    expect(instance.switchOn()).toBe(false);
    expect(instance.activeKeyframes().size).toBe(0);
  });

  it('toggleSwitch() turns the switch on', async () => {
    const { instance, destroy } = await renderOnce(MotionDemo);
    destroyDemo = destroy;

    instance.toggleSwitch();
    await flush();
    expect(instance.switchOn()).toBe(true);
  });

  it('toggleSwitch() toggles back off on a second call', async () => {
    const { instance, destroy } = await renderOnce(MotionDemo);
    destroyDemo = destroy;

    instance.toggleSwitch();
    await flush();
    instance.toggleSwitch();
    await flush();
    expect(instance.switchOn()).toBe(false);
  });

  it('toggleKeyframe() activates and deactivates a preset', async () => {
    const { instance, destroy } = await renderOnce(MotionDemo);
    destroyDemo = destroy;

    instance.toggleKeyframe('spin');
    await flush();
    expect(instance.isKeyframeActive('spin')).toBe(true);

    instance.toggleKeyframe('spin');
    await flush();
    expect(instance.isKeyframeActive('spin')).toBe(false);
  });

  it('tracks multiple active keyframes independently', async () => {
    const { instance, destroy } = await renderOnce(MotionDemo);
    destroyDemo = destroy;

    instance.toggleKeyframe('spin');
    instance.toggleKeyframe('pulse');
    await flush();

    expect(instance.isKeyframeActive('spin')).toBe(true);
    expect(instance.isKeyframeActive('pulse')).toBe(true);
    expect(instance.isKeyframeActive('bounce')).toBe(false);
  });

  it('tapping a keyframe tile toggles it', async () => {
    const { instance, container, destroy } = await renderOnce(MotionDemo);
    destroyDemo = destroy;
    const { getByText } = getQueriesForElement(container as HTMLElement);

    // "Spin" sits in the tile's label column (flex-col); the (bindtap) is on
    // the tile <view> one level above that column.
    fireEvent.tap(getByText('Spin').parentElement!.parentElement!);
    await flush();
    expect(instance.isKeyframeActive('spin')).toBe(true);
  });
});

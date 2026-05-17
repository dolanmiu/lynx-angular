import { describe, expect, it } from 'vitest';
import {
  fireEvent,
  render,
  waitForUpdate,
} from '@blotch/angular-lynx-testing-library';
import { MotionDemoComponent } from './motion-demo.component';

describe('MotionDemoComponent', () => {
  it('renders all section titles', async () => {
    const { getByText } = await render(MotionDemoComponent);
    expect(getByText('CSS Transitions')).toBeTruthy();
    expect(getByText('CSS Keyframe Animations')).toBeTruthy();
    expect(getByText('JS Animate API')).toBeTruthy();
  });

  it('starts with all animation signals false', async () => {
    const { componentRef } = await render(MotionDemoComponent);
    const instance = componentRef.instance as MotionDemoComponent;

    expect(instance.transitionActive()).toBe(false);
    expect(instance.rotateActive()).toBe(false);
    expect(instance.pulseActive()).toBe(false);
  });

  it('toggleTransition() sets transitionActive to true', async () => {
    const { componentRef } = await render(MotionDemoComponent);
    const instance = componentRef.instance as MotionDemoComponent;

    instance.toggleTransition();
    await waitForUpdate();
    expect(instance.transitionActive()).toBe(true);
  });

  it('toggleTransition() toggles back to false on second call', async () => {
    const { componentRef } = await render(MotionDemoComponent);
    const instance = componentRef.instance as MotionDemoComponent;

    instance.toggleTransition();
    await waitForUpdate();
    instance.toggleTransition();
    await waitForUpdate();
    expect(instance.transitionActive()).toBe(false);
  });

  it('toggleRotate() sets rotateActive to true', async () => {
    const { componentRef } = await render(MotionDemoComponent);
    const instance = componentRef.instance as MotionDemoComponent;

    instance.toggleRotate();
    await waitForUpdate();
    expect(instance.rotateActive()).toBe(true);
  });

  it('togglePulse() sets pulseActive to true', async () => {
    const { componentRef } = await render(MotionDemoComponent);
    const instance = componentRef.instance as MotionDemoComponent;

    instance.togglePulse();
    await waitForUpdate();
    expect(instance.pulseActive()).toBe(true);
  });

  it('tapping Tap me box calls toggleTransition()', async () => {
    const { componentRef, getByText } = await render(MotionDemoComponent);
    const instance = componentRef.instance as MotionDemoComponent;

    // (bindtap) is on the <view> wrapper; tap the parent, not the inner <text>.
    fireEvent.tap(getByText('Tap me').parentElement!);
    await waitForUpdate();
    expect(instance.transitionActive()).toBe(true);
  });

  it('tapping Rotate box toggles rotateActive', async () => {
    const { componentRef, getByText } = await render(MotionDemoComponent);
    const instance = componentRef.instance as MotionDemoComponent;

    fireEvent.tap(getByText('Rotate').parentElement!);
    await waitForUpdate();
    expect(instance.rotateActive()).toBe(true);
  });

  it('tapping Pulse box toggles pulseActive', async () => {
    const { componentRef, getByText } = await render(MotionDemoComponent);
    const instance = componentRef.instance as MotionDemoComponent;

    fireEvent.tap(getByText('Pulse').parentElement!);
    await waitForUpdate();
    expect(instance.pulseActive()).toBe(true);
  });
});

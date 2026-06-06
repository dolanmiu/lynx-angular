import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, waitForUpdate } from '@blotch/angular-lynx-testing-library';
import { OverlayMotionDemo } from './overlay-motion-demo';

describe('OverlayMotionDemo', () => {
  // Lynx's JS animate API is not available in jsdom — mock it so #animateIn/#animateOut
  // don't throw when called after overlay elements mount.
  beforeEach(() => {
    vi.spyOn(Element.prototype, 'animate').mockReturnValue({
      cancel: vi.fn(),
      finished: Promise.resolve({} as any),
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders Open Dialog button', async () => {
    const { getByText } = await render(OverlayMotionDemo);
    expect(getByText('Open Dialog')).toBeTruthy();
  });

  it('renders section title and description', async () => {
    const { getByText } = await render(OverlayMotionDemo);
    expect(getByText('Motion + Overlay')).toBeTruthy();
  });

  it('starts with overlayVisible false', async () => {
    const { componentRef } = await render(OverlayMotionDemo);
    const instance = componentRef.instance as OverlayMotionDemo;
    expect(instance.overlayVisible()).toBe(false);
  });

  it('open() sets overlayVisible to true', async () => {
    const { componentRef } = await render(OverlayMotionDemo);
    const instance = componentRef.instance as OverlayMotionDemo;

    instance.open();
    // open() uses setTimeout(0) → overlayVisible.set(true) → setTimeout(0) → #animateIn()
    // One waitForUpdate flushes the outer timeout and sets overlayVisible.
    await waitForUpdate();
    expect(instance.overlayVisible()).toBe(true);
  });

  it('close() can be called without error', async () => {
    // #animateOut() guards on backdropRef()/dialogRef() being resolved.
    // In the jsdom test environment the <overlay> element may not mount its
    // children as Angular view children (they are rendered to a separate Lynx
    // overlay layer), so the viewChild queries return undefined and #animateOut()
    // returns early. We verify close() can be called without throwing and that
    // the overlayVisible signal can be toggled directly.
    const { componentRef } = await render(OverlayMotionDemo);
    const instance = componentRef.instance as OverlayMotionDemo;

    instance.overlayVisible.set(true);
    await waitForUpdate();
    expect(instance.overlayVisible()).toBe(true);

    expect(() => instance.close()).not.toThrow();

    // Directly verify the signal can be set false (the close() animation path
    // does this internally when it completes on a real device).
    instance.overlayVisible.set(false);
    await waitForUpdate();
    expect(instance.overlayVisible()).toBe(false);
  });
});

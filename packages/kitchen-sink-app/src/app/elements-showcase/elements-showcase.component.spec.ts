import { describe, expect, it } from 'vitest';
import {
  fireEvent,
  render,
  waitForUpdate,
} from '@blotch/angular-lynx-testing-library';
import { ElementsShowcaseComponent } from './elements-showcase.component';

describe('ElementsShowcaseComponent', () => {
  it('renders the showcase title', async () => {
    const { getByText } = await render(ElementsShowcaseComponent);
    expect(getByText('Lynx Elements Showcase')).toBeTruthy();
  });

  it('renders with initial tap count of 0', async () => {
    const { getByText } = await render(ElementsShowcaseComponent);
    expect(getByText('Taps: 0')).toBeTruthy();
  });

  it('tapping the Tap Me button increments tapCount', async () => {
    const { componentRef, getByText } = await render(ElementsShowcaseComponent);
    const instance = componentRef.instance as ElementsShowcaseComponent;

    expect(instance.tapCount()).toBe(0);
    // (bindtap) is on the <view> wrapper; tap the parent, not the inner <text>.
    fireEvent.tap(getByText('Tap Me').parentElement!);
    await waitForUpdate();
    expect(instance.tapCount()).toBe(1);
  });

  it('handleTap() increments tapCount multiple times', async () => {
    const { componentRef } = await render(ElementsShowcaseComponent);
    const instance = componentRef.instance as ElementsShowcaseComponent;

    instance.handleTap();
    instance.handleTap();
    instance.handleTap();
    await waitForUpdate();
    expect(instance.tapCount()).toBe(3);
  });

  it('toggleVisibility() flips isVisible from true to false', async () => {
    const { componentRef } = await render(ElementsShowcaseComponent);
    const instance = componentRef.instance as ElementsShowcaseComponent;

    expect(instance.isVisible()).toBe(true);
    instance.toggleVisibility();
    await waitForUpdate();
    expect(instance.isVisible()).toBe(false);
  });

  it('renders the list element section', async () => {
    // Lynx <list> virtualizes its children — list-items are not rendered as DOM
    // children in the test environment (they appear in update-list-info metadata).
    // We verify the surrounding card structure renders correctly instead.
    const { getByText } = await render(ElementsShowcaseComponent);
    expect(getByText('list')).toBeTruthy();
    expect(getByText('Optimized container for list items')).toBeTruthy();
  });
});

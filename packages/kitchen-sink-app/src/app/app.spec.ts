import { describe, expect, it } from 'vitest';
import { provideRouter } from '@angular/router';
import {
  fireEvent,
  render,
  waitForUpdate,
} from '@blotch/angular-lynx-testing-library';
import { App } from './app';

describe('App', () => {
  it('renders title text', async () => {
    const { getByText } = await render(App, {
      providers: [provideRouter([])],
    });
    expect(getByText('Angular')).toBeTruthy();
    expect(getByText('on Lynx')).toBeTruthy();
  });

  it('renders all navigation buttons', async () => {
    const { getByText } = await render(App, {
      providers: [provideRouter([])],
    });
    expect(getByText('Elements Showcase')).toBeTruthy();
    expect(getByText('List Example')).toBeTruthy();
    expect(getByText('Scroll Example')).toBeTruthy();
    expect(getByText('querySelector Demo')).toBeTruthy();
    expect(getByText('Tailwind Demo')).toBeTruthy();
    expect(getByText('Motion Demo')).toBeTruthy();
    expect(getByText('Overlay + Motion')).toBeTruthy();
  });

  it('alterLogo starts as false', async () => {
    const { componentRef } = await render(App, {
      providers: [provideRouter([])],
    });
    const instance = componentRef.instance as App;
    expect(instance.alterLogo()).toBe(false);
  });

  it('onTap() toggles alterLogo', async () => {
    const { componentRef } = await render(App, {
      providers: [provideRouter([])],
    });
    const instance = componentRef.instance as App;

    instance.onTap({} as any);
    await waitForUpdate();
    expect(instance.alterLogo()).toBe(true);

    instance.onTap({} as any);
    await waitForUpdate();
    expect(instance.alterLogo()).toBe(false);
  });

  it('openOverlay() sets showOverlay to true', async () => {
    const { componentRef } = await render(App, {
      providers: [provideRouter([])],
    });
    const instance = componentRef.instance as App;

    expect(instance.showOverlay()).toBe(false);
    instance.openOverlay();
    await waitForUpdate();
    expect(instance.showOverlay()).toBe(true);
  });

  it('closeOverlay() sets showOverlay to false', async () => {
    const { componentRef } = await render(App, {
      providers: [provideRouter([])],
    });
    const instance = componentRef.instance as App;

    instance.openOverlay();
    await waitForUpdate();
    expect(instance.showOverlay()).toBe(true);

    instance.closeOverlay();
    await waitForUpdate();
    expect(instance.showOverlay()).toBe(false);
  });

  it('tapping Open Overlay button opens the overlay', async () => {
    const { componentRef, getByText } = await render(App, {
      providers: [provideRouter([])],
    });
    const instance = componentRef.instance as App;

    // (bindtap) is on the <view> wrapper; tap the parent, not the inner <text>.
    fireEvent.tap(getByText('Open Overlay').parentElement!);
    await waitForUpdate();
    expect(instance.showOverlay()).toBe(true);
  });
});

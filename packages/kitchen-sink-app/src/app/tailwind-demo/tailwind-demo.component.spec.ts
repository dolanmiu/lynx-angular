import { describe, expect, it } from 'vitest';
import {
  fireEvent,
  render,
  waitForUpdate,
} from '@blotch/angular-lynx-testing-library';
import { TailwindDemoComponent } from './tailwind-demo.component';

describe('TailwindDemoComponent', () => {
  it('renders the demo title', async () => {
    const { getByText } = await render(TailwindDemoComponent);
    expect(getByText('Tailwind CSS Demo')).toBeTruthy();
  });

  it('renders color palette labels', async () => {
    const { getByText } = await render(TailwindDemoComponent);
    expect(getByText('bg-blue-500')).toBeTruthy();
    expect(getByText('bg-emerald-500')).toBeTruthy();
    expect(getByText('bg-rose-500')).toBeTruthy();
    expect(getByText('bg-amber-400')).toBeTruthy();
  });

  it('renders spacing demo labels', async () => {
    const { getByText } = await render(TailwindDemoComponent);
    expect(getByText('p-2')).toBeTruthy();
    expect(getByText('p-4')).toBeTruthy();
    expect(getByText('p-8')).toBeTruthy();
  });

  it('renders initial count of 0', async () => {
    const { componentRef } = await render(TailwindDemoComponent);
    const instance = componentRef.instance as TailwindDemoComponent;
    expect(instance.count()).toBe(0);
  });

  it('increment() increases count by 1', async () => {
    const { componentRef } = await render(TailwindDemoComponent);
    const instance = componentRef.instance as TailwindDemoComponent;

    instance.increment();
    await waitForUpdate();
    expect(instance.count()).toBe(1);
  });

  it('increment() accumulates across multiple calls', async () => {
    const { componentRef } = await render(TailwindDemoComponent);
    const instance = componentRef.instance as TailwindDemoComponent;

    instance.increment();
    instance.increment();
    instance.increment();
    await waitForUpdate();
    expect(instance.count()).toBe(3);
  });

  it('resetCount() resets to 0', async () => {
    const { componentRef } = await render(TailwindDemoComponent);
    const instance = componentRef.instance as TailwindDemoComponent;

    instance.increment();
    instance.increment();
    await waitForUpdate();
    expect(instance.count()).toBe(2);

    instance.resetCount();
    await waitForUpdate();
    expect(instance.count()).toBe(0);
  });

  it('tapping + Increment button increments count via fireEvent', async () => {
    const { componentRef, getByText } = await render(TailwindDemoComponent);
    const instance = componentRef.instance as TailwindDemoComponent;

    // (bindtap) is on the <view> wrapper; tap the parent, not the inner <text>.
    fireEvent.tap(getByText('+ Increment').parentElement!);
    await waitForUpdate();
    expect(instance.count()).toBe(1);
  });

  it('tapping Reset button resets count to 0', async () => {
    const { componentRef, getByText } = await render(TailwindDemoComponent);
    const instance = componentRef.instance as TailwindDemoComponent;

    instance.increment();
    await waitForUpdate();
    expect(instance.count()).toBe(1);

    fireEvent.tap(getByText('Reset').parentElement!);
    await waitForUpdate();
    expect(instance.count()).toBe(0);
  });
});

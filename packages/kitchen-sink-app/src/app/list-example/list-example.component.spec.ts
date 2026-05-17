import { describe, expect, it } from 'vitest';
import {
  fireEvent,
  render,
  waitForUpdate,
} from '@blotch/angular-lynx-testing-library';
import { ListExampleComponent } from './list-example.component';

describe('ListExampleComponent', () => {
  it('renders the title', async () => {
    const { getByText } = await render(ListExampleComponent);
    expect(getByText('List Example')).toBeTruthy();
  });

  it('renders toggle and add item buttons', async () => {
    const { getByText } = await render(ListExampleComponent);
    expect(getByText(/Toggle Items/)).toBeTruthy();
    expect(getByText('Add Item')).toBeTruthy();
  });

  it('starts with showItems as false', async () => {
    const { componentRef } = await render(ListExampleComponent);
    const instance = componentRef.instance as ListExampleComponent;
    expect(instance.showItems()).toBe(false);
  });

  it('toggleItems() flips showItems from false to true', async () => {
    const { componentRef } = await render(ListExampleComponent);
    const instance = componentRef.instance as ListExampleComponent;

    instance.toggleItems();
    await waitForUpdate();
    expect(instance.showItems()).toBe(true);
  });

  it('toggleItems() toggles back to false on second call', async () => {
    const { componentRef } = await render(ListExampleComponent);
    const instance = componentRef.instance as ListExampleComponent;

    instance.toggleItems();
    instance.toggleItems();
    await waitForUpdate();
    expect(instance.showItems()).toBe(false);
  });

  it('tapping Toggle Items button flips showItems', async () => {
    const { componentRef, getByText } = await render(ListExampleComponent);
    const instance = componentRef.instance as ListExampleComponent;

    // (bindtap) is on the <view> parent; getByText returns the inner <text> child.
    // Lynx events don't bubble through the custom event system, so tap the view.
    fireEvent.tap(getByText(/Toggle Items/).parentElement!);
    await waitForUpdate();
    expect(instance.showItems()).toBe(true);
  });

  it('starts with 3 items in the items signal', async () => {
    const { componentRef } = await render(ListExampleComponent);
    const instance = componentRef.instance as ListExampleComponent;
    expect(instance.items()).toHaveLength(3);
  });

  it('addItem() appends a new item', async () => {
    const { componentRef } = await render(ListExampleComponent);
    const instance = componentRef.instance as ListExampleComponent;

    instance.addItem();
    await waitForUpdate();
    expect(instance.items()).toHaveLength(4);
    expect(instance.items()[3].text).toBe('Item 4');
  });

  it('tapping Add Item button adds an item', async () => {
    const { componentRef, getByText } = await render(ListExampleComponent);
    const instance = componentRef.instance as ListExampleComponent;

    fireEvent.tap(getByText('Add Item').parentElement!);
    await waitForUpdate();
    expect(instance.items()).toHaveLength(4);
  });

  it('nextId increments after addItem()', async () => {
    const { componentRef } = await render(ListExampleComponent);
    const instance = componentRef.instance as ListExampleComponent;

    expect(instance.nextId()).toBe(4);
    instance.addItem();
    await waitForUpdate();
    expect(instance.nextId()).toBe(5);
  });
});

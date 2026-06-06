import { describe, expect, it } from 'vitest';
import { render } from '@blotch/angular-lynx-testing-library';
import { QuerySelectorDemo } from './query-selector-demo';

describe('QuerySelectorDemo', () => {
  it('renders the page title', async () => {
    const { getByText } = await render(QuerySelectorDemo);
    expect(getByText('querySelector Demo')).toBeTruthy();
  });

  it('renders the element tree being queried', async () => {
    const { getByText } = await render(QuerySelectorDemo);
    expect(getByText('Item A')).toBeTruthy();
    expect(getByText('Item B (active)')).toBeTruthy();
    expect(getByText('Item C')).toBeTruthy();
    expect(getByText('Label')).toBeTruthy();
  });

  it('qsActive is resolved after view init (class selector works)', async () => {
    const { componentRef } = await render(QuerySelectorDemo);
    const instance = componentRef.instance as QuerySelectorDemo;

    expect(instance.qsActive()).not.toBe('pending');
    expect(instance.qsActive()).toBe('found ✓');
  });

  it('qsAllCount reflects 3 qs-item elements (querySelectorAll works)', async () => {
    const { componentRef } = await render(QuerySelectorDemo);
    const instance = componentRef.instance as QuerySelectorDemo;

    expect(instance.qsAllCount()).not.toBe('pending');
    expect(instance.qsAllCount()).toBe('3');
  });

  it('qsById finds element by ID selector', async () => {
    const { componentRef } = await render(QuerySelectorDemo);
    const instance = componentRef.instance as QuerySelectorDemo;

    expect(instance.qsById()).not.toBe('pending');
    expect(instance.qsById()).toBe('found ✓');
  });

  it('qsCompound finds element with compound tag+class selector', async () => {
    const { componentRef } = await render(QuerySelectorDemo);
    const instance = componentRef.instance as QuerySelectorDemo;

    expect(instance.qsCompound()).not.toBe('pending');
    expect(instance.qsCompound()).toBe('found ✓');
  });

  it('qsCombinator is resolved (not pending) after view init', async () => {
    const { componentRef } = await render(QuerySelectorDemo);
    const instance = componentRef.instance as QuerySelectorDemo;

    // Note: jsdom's native CSS engine DOES support descendant combinator selectors
    // ('view view'), so the result here is 'found (unexpected) ✗' in tests.
    // On a real Lynx device the background thread's querySelector intentionally
    // does NOT support combinators and returns null ✓. We only verify the signal
    // was resolved (not left as 'pending') since the expected value differs by env.
    expect(instance.qsCombinator()).not.toBe('pending');
  });
});

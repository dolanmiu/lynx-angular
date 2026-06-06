import { describe, expect, it } from 'vitest';
import { render } from '@blotch/angular-lynx-testing-library';
import { ScrollExample } from './scroll-example';

describe('ScrollExample', () => {
  it('renders the page title', async () => {
    const { getByText } = await render(ScrollExample);
    expect(getByText('Scroll View Example')).toBeTruthy();
  });

  it('renders horizontal and vertical section labels', async () => {
    const { getAllByText } = await render(ScrollExample);
    // Both 'Horizontal Scroll' and 'Vertical Scroll' subtitles should be present
    expect(getAllByText('Horizontal Scroll')).toHaveLength(1);
    expect(getAllByText('Vertical Scroll')).toHaveLength(1);
  });

  it('renders all 8 horizontal scroll items', async () => {
    const { getByText } = await render(ScrollExample);
    for (let i = 1; i <= 8; i++) {
      expect(getByText(`Horizontal ${i}`)).toBeTruthy();
    }
  });

  it('renders all 10 vertical scroll items', async () => {
    const { getByText } = await render(ScrollExample);
    for (let i = 1; i <= 10; i++) {
      expect(getByText(`Vertical ${i}`)).toBeTruthy();
    }
  });

  it('horizontalItems array has 8 entries', async () => {
    const { componentRef } = await render(ScrollExample);
    const instance = componentRef.instance as ScrollExample;
    expect(instance.horizontalItems).toHaveLength(8);
  });

  it('verticalItems array has 10 entries', async () => {
    const { componentRef } = await render(ScrollExample);
    const instance = componentRef.instance as ScrollExample;
    expect(instance.verticalItems).toHaveLength(10);
  });
});

import { describe, expect, it } from 'vitest';
import { render } from '@blotch/angular-lynx-testing-library';
import { ScrollExampleComponent } from './scroll-example.component';

describe('ScrollExampleComponent', () => {
  it('renders the page title', async () => {
    const { getByText } = await render(ScrollExampleComponent);
    expect(getByText('Scroll View Example')).toBeTruthy();
  });

  it('renders horizontal and vertical section labels', async () => {
    const { getAllByText } = await render(ScrollExampleComponent);
    // Both 'Horizontal Scroll' and 'Vertical Scroll' subtitles should be present
    expect(getAllByText('Horizontal Scroll')).toHaveLength(1);
    expect(getAllByText('Vertical Scroll')).toHaveLength(1);
  });

  it('renders all 8 horizontal scroll items', async () => {
    const { getByText } = await render(ScrollExampleComponent);
    for (let i = 1; i <= 8; i++) {
      expect(getByText(`Horizontal ${i}`)).toBeTruthy();
    }
  });

  it('renders all 10 vertical scroll items', async () => {
    const { getByText } = await render(ScrollExampleComponent);
    for (let i = 1; i <= 10; i++) {
      expect(getByText(`Vertical ${i}`)).toBeTruthy();
    }
  });

  it('horizontalItems array has 8 entries', async () => {
    const { componentRef } = await render(ScrollExampleComponent);
    const instance = componentRef.instance as ScrollExampleComponent;
    expect(instance.horizontalItems).toHaveLength(8);
  });

  it('verticalItems array has 10 entries', async () => {
    const { componentRef } = await render(ScrollExampleComponent);
    const instance = componentRef.instance as ScrollExampleComponent;
    expect(instance.verticalItems).toHaveLength(10);
  });
});

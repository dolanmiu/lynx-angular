import { describe, expect, it } from 'vitest';
import { EmulatedLynxRenderer } from './emulated-lynx-renderer';
import { LynxBackgroundDocument } from './lynx-document';

describe('EmulatedLynxRenderer', () => {
  const createRenderer = (componentId: string) => {
    const doc = new LynxBackgroundDocument();
    return new EmulatedLynxRenderer(doc, componentId);
  };

  it('createElement adds _ngcontent attribute', () => {
    const renderer = createRenderer('abc123');
    const el = renderer.createElement('x-view');

    expect(el.getAttribute('_ngcontent-abc123')).toBe('');
  });

  it('selectRootElement adds _nghost attribute', () => {
    const renderer = createRenderer('abc123');
    const el = renderer.selectRootElement();

    expect(el.getAttribute('_nghost-abc123')).toBe('');
  });

  it('host element does not get _ngcontent attribute', () => {
    const renderer = createRenderer('abc123');
    const el = renderer.selectRootElement();

    expect(el.getAttribute('_ngcontent-abc123')).toBeNull();
  });

  it('child element does not get _nghost attribute', () => {
    const renderer = createRenderer('abc123');
    const el = renderer.createElement('x-view');

    expect(el.getAttribute('_nghost-abc123')).toBeNull();
  });

  it('different components get different scoping attributes', () => {
    const renderer1 = createRenderer('comp1');
    const renderer2 = createRenderer('comp2');

    const el1 = renderer1.createElement('x-view');
    const el2 = renderer2.createElement('x-view');

    expect(el1.getAttribute('_ngcontent-comp1')).toBe('');
    expect(el1.getAttribute('_ngcontent-comp2')).toBeNull();

    expect(el2.getAttribute('_ngcontent-comp2')).toBe('');
    expect(el2.getAttribute('_ngcontent-comp1')).toBeNull();
  });

  it('createComment does not add scoping attributes', () => {
    const renderer = createRenderer('abc123');
    const el = renderer.createComment('test');

    expect(el.getAttribute('_ngcontent-abc123')).toBeNull();
  });

  it('createText does not add scoping attributes', () => {
    const renderer = createRenderer('abc123');
    const el = renderer.createText('hello');

    expect(el.getAttribute('_ngcontent-abc123')).toBeNull();
  });
});

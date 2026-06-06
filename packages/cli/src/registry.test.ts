import { describe, expect, it } from 'vitest';

import { getComponentNames, getEntry, resolveDependencies } from './registry';

describe('getComponentNames', () => {
  it('returns all component names', () => {
    const names = getComponentNames();
    expect(names).toContain('button');
    expect(names).toContain('card');
    expect(names).toContain('spinner');
    expect(names.length).toBeGreaterThan(0);
  });
});

describe('getEntry', () => {
  it('returns entry for existing component', () => {
    const entry = getEntry('button');
    expect(entry).toEqual({
      name: 'button',
      dependencies: ['spinner'],
    });
  });

  it('returns undefined for non-existent component', () => {
    expect(getEntry('nonexistent')).toBeUndefined();
  });
});

describe('resolveDependencies', () => {
  it('returns component with no dependencies', () => {
    expect(resolveDependencies(['card'])).toEqual(['card']);
  });

  it('resolves transitive dependencies in dependency-first order', () => {
    const resolved = resolveDependencies(['button']);
    expect(resolved).toEqual(['spinner', 'button']);
  });

  it('deduplicates when dependency is also explicitly listed', () => {
    const resolved = resolveDependencies(['button', 'spinner']);
    expect(resolved).toEqual(['spinner', 'button']);
  });

  it('handles empty input', () => {
    expect(resolveDependencies([])).toEqual([]);
  });

  it('resolves empty-state with its icon dependency', () => {
    const resolved = resolveDependencies(['empty-state']);
    expect(resolved).toEqual(['icon', 'empty-state']);
  });

  it('skips unknown component names', () => {
    expect(resolveDependencies(['nonexistent'])).toEqual([]);
  });
});

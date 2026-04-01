import { describe, expect, it } from 'vitest';
import { generateComponentScopeId } from './component-scope-id';

describe('generateComponentScopeId', () => {
  // Format
  it('returns a string starting with "l"', () => {
    const id = generateComponentScopeId(
      'AppComponent',
      '/src/app.component.ts',
    );
    expect(id.startsWith('l')).toBe(true);
  });

  it('returns exactly 11 characters (l + 10 hex chars)', () => {
    const id = generateComponentScopeId(
      'AppComponent',
      '/src/app.component.ts',
    );
    expect(id).toHaveLength(11);
  });

  it('contains only lowercase hex characters after the prefix', () => {
    const id = generateComponentScopeId(
      'AppComponent',
      '/src/app.component.ts',
    );
    expect(id.slice(1)).toMatch(/^[0-9a-f]{10}$/);
  });

  // Determinism
  it('returns the same ID for identical inputs', () => {
    const id1 = generateComponentScopeId(
      'AppComponent',
      '/src/app.component.ts',
    );
    const id2 = generateComponentScopeId(
      'AppComponent',
      '/src/app.component.ts',
    );
    expect(id1).toBe(id2);
  });

  // Uniqueness
  it('returns different IDs for different class names', () => {
    const id1 = generateComponentScopeId(
      'AppComponent',
      '/src/app.component.ts',
    );
    const id2 = generateComponentScopeId(
      'HomeComponent',
      '/src/app.component.ts',
    );
    expect(id1).not.toBe(id2);
  });

  it('returns different IDs for different file paths', () => {
    const id1 = generateComponentScopeId(
      'AppComponent',
      '/src/app.component.ts',
    );
    const id2 = generateComponentScopeId(
      'AppComponent',
      '/src/home.component.ts',
    );
    expect(id1).not.toBe(id2);
  });
});

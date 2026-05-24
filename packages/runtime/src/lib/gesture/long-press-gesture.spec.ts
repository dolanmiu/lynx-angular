import { describe, expect, it } from 'vitest';
import { LongPressGesture } from './long-press-gesture';
import { GestureType } from './types';

describe('LongPressGesture', () => {
  it('has type GestureType.LONGPRESS', () => {
    expect(new LongPressGesture().type).toBe(GestureType.LONGPRESS);
  });

  describe('minDuration()', () => {
    it('sets the minDuration config value in milliseconds', () => {
      const g = new LongPressGesture();

      g.minDuration(500);

      expect(g._config['minDuration']).toBe(500);
    });

    it('returns this for chaining', () => {
      expect(new LongPressGesture().minDuration(500)).toBeInstanceOf(
        LongPressGesture,
      );
    });
  });

  describe('maxDistance()', () => {
    it('sets the maxDistance config value in pixels', () => {
      const g = new LongPressGesture();

      g.maxDistance(10);

      expect(g._config['maxDistance']).toBe(10);
    });

    it('returns this for chaining', () => {
      expect(new LongPressGesture().maxDistance(10)).toBeInstanceOf(
        LongPressGesture,
      );
    });
  });

  it('supports fluent chaining', () => {
    const g = new LongPressGesture();

    const result = g.minDuration(500).maxDistance(10);

    expect(result).toBe(g);
    expect(g._config).toEqual({ minDuration: 500, maxDistance: 10 });
  });
});

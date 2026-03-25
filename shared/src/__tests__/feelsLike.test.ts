import { describe, it, expect } from 'vitest';
import { calcFeelsLike, calcFeelsLikeCold, calcFeelsLikeHot } from '../utils/feelsLike.js';

describe('calcFeelsLikeCold', () => {
  it('returns temp when wind is very low', () => {
    expect(calcFeelsLikeCold(5, 0.5)).toBe(5);
  });

  it('calculates wind chill correctly', () => {
    const result = calcFeelsLikeCold(0, 10);
    expect(result).toBeLessThan(0);
  });

  it('lower wind speed means higher feels-like', () => {
    const low = calcFeelsLikeCold(-5, 3);
    const high = calcFeelsLikeCold(-5, 10);
    expect(low).toBeGreaterThan(high);
  });
});

describe('calcFeelsLikeHot', () => {
  it('calculates heat index', () => {
    const result = calcFeelsLikeHot(30, 80);
    expect(result).toBeGreaterThan(30);
  });
});

describe('calcFeelsLike', () => {
  it('uses cold formula for 10°C and below', () => {
    const result = calcFeelsLike(5, 10, 50);
    expect(result).toBeLessThan(5);
  });

  it('uses hot formula for above 10°C', () => {
    const result = calcFeelsLike(30, 3, 80);
    expect(result).toBeGreaterThan(25);
  });
});

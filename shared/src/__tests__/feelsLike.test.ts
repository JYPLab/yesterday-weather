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
  it('calculates heat index for high temps', () => {
    const result = calcFeelsLikeHot(35, 80);
    expect(result).toBeGreaterThan(35);
  });
});

describe('calcFeelsLike', () => {
  it('uses cold formula for 10°C and below', () => {
    const result = calcFeelsLike(5, 10, 50);
    expect(result).toBeLessThan(5);
  });

  it('returns raw temp for 10~33°C range', () => {
    const result = calcFeelsLike(20, 3, 60);
    expect(result).toBe(20);
  });

  it('returns raw temp at 11°C (no heat index applied)', () => {
    const result = calcFeelsLike(11, 2.5, 52);
    expect(result).toBe(11);
  });

  it('uses hot formula for 33°C and above', () => {
    const result = calcFeelsLike(35, 3, 80);
    expect(result).toBeGreaterThan(35);
  });
});

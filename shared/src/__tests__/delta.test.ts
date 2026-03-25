import { describe, it, expect } from 'vitest';
import { calcDelta } from '../utils/delta.js';
import type { WeatherData } from '../types/weather.js';

const baseWeather: WeatherData = {
  feelsLike: 10,
  tempMin: 5,
  tempMax: 15,
  rainProb: 20,
  windSpeed: 3,
  isSnow: false,
  humidity: 50,
  temperature: 10,
};

describe('calcDelta', () => {
  it('calculates temperature deltas', () => {
    const today = { ...baseWeather, feelsLike: 5, tempMin: 2, tempMax: 12 };
    const delta = calcDelta(baseWeather, today);
    expect(delta.feelsLikeDelta).toBe(-5);
    expect(delta.tempMinDelta).toBe(-3);
    expect(delta.tempMaxDelta).toBe(-3);
  });

  it('detects new rain', () => {
    const today = { ...baseWeather, rainProb: 70 };
    const delta = calcDelta(baseWeather, today);
    expect(delta.newRain).toBe(true);
    expect(delta.newSnow).toBe(false);
  });

  it('does not flag rain if yesterday also rainy', () => {
    const yesterday = { ...baseWeather, rainProb: 80 };
    const today = { ...baseWeather, rainProb: 70 };
    const delta = calcDelta(yesterday, today);
    expect(delta.newRain).toBe(false);
  });

  it('detects new snow', () => {
    const today = { ...baseWeather, rainProb: 70, isSnow: true };
    const delta = calcDelta(baseWeather, today);
    expect(delta.newSnow).toBe(true);
    expect(delta.newRain).toBe(false);
  });

  it('detects strong wind increase', () => {
    const today = { ...baseWeather, windSpeed: 7 };
    const delta = calcDelta(baseWeather, today);
    expect(delta.newWind).toBe(true);
  });

  it('does not flag wind for small increase', () => {
    const today = { ...baseWeather, windSpeed: 5 };
    const delta = calcDelta(baseWeather, today);
    expect(delta.newWind).toBe(false);
  });
});

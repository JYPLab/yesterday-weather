import type { WeatherData, Delta } from '../types/weather.js';

export function calcDelta(yesterday: WeatherData, today: WeatherData): Delta {
  const feelsLikeDelta = today.feelsLike - yesterday.feelsLike;
  const tempMinDelta = today.tempMin - yesterday.tempMin;
  const tempMaxDelta = today.tempMax - yesterday.tempMax;
  const windDelta = today.windSpeed - yesterday.windSpeed;

  const newRain =
    yesterday.rainProb < 60 && today.rainProb >= 60 && !today.isSnow;
  const newSnow =
    !yesterday.isSnow && today.isSnow && today.rainProb >= 60;
  const newWind = windDelta >= 3;

  return {
    feelsLikeDelta,
    tempMinDelta,
    tempMaxDelta,
    windDelta,
    newRain,
    newSnow,
    newWind,
  };
}

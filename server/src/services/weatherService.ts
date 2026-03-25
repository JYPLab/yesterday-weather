import { calcDelta, buildEmoji, buildDesc, buildTempSuffix } from 'yesterday-weather-shared';
import type { WeatherComparison, SessionDelta } from 'yesterday-weather-shared';
import { getVilageFcst } from '../api/kma.js';
import { transformForecast } from '../api/transform.js';
import { getCachedWeather, setCachedWeather } from './cacheService.js';

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function getYesterday(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d;
}

/**
 * 적절한 base_time 결정 (가장 최근 발표 시간)
 */
function getBaseTime(): string {
  const hour = new Date().getHours();
  const baseTimes = [23, 20, 17, 14, 11, 8, 5, 2];
  for (const bt of baseTimes) {
    if (hour >= bt) return String(bt).padStart(2, '0') + '00';
  }
  return '2300'; // 자정~2시: 전날 23시 발표분
}

async function getWeatherForDate(
  nx: number,
  ny: number,
  date: Date
): Promise<ReturnType<typeof transformForecast>> {
  const dateStr = formatDate(date);

  const cached = await getCachedWeather(nx, ny, dateStr);
  if (cached) return cached;

  const baseTime = getBaseTime();
  // 어제 데이터는 어제 날짜의 0500 기준 예보 사용
  const items = await getVilageFcst(nx, ny, dateStr, baseTime);
  const result = transformForecast(items, dateStr);

  await setCachedWeather(nx, ny, dateStr, result);
  return result;
}

export async function getWeatherComparison(
  nx: number,
  ny: number
): Promise<WeatherComparison> {
  const today = new Date();
  const yesterday = getYesterday();

  const [todayWeather, yesterdayWeather] = await Promise.all([
    getWeatherForDate(nx, ny, today),
    getWeatherForDate(nx, ny, yesterday),
  ]);

  const delta: SessionDelta = {
    morning: calcDelta(yesterdayWeather.morning, todayWeather.morning),
    afternoon: calcDelta(
      yesterdayWeather.afternoon,
      todayWeather.afternoon
    ),
    daily: calcDelta(yesterdayWeather.daily, todayWeather.daily),
  };

  const emoji = buildEmoji(delta.daily);
  const description = buildDesc(delta.daily);
  const tempSuffix = buildTempSuffix(delta.daily);

  return {
    today: todayWeather,
    yesterday: yesterdayWeather,
    delta,
    emoji,
    description,
    tempSuffix,
  };
}

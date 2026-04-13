import { calcDelta, buildEmoji, buildDesc, buildTempSuffix } from 'yesterday-weather-shared';
import type { WeatherComparison, SessionDelta, SessionWeather } from 'yesterday-weather-shared';
import { getVilageFcst } from '../api/kma.js';
import { transformForecast } from '../api/transform.js';
import { getCachedWeather, setCachedWeather } from './cacheService.js';

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * 현재 시각 기준 가장 최근 단기예보 발표 시각과 base_date 결정
 *
 * 단기예보 발표시각: 0200, 0500, 0800, 1100, 1400, 1700, 2000, 2300
 * API는 발표 후 약 10분부터 제공
 * 0시~2시 10분 사이에는 전날 2300 발표분 사용 (base_date도 전날)
 */
function getLatestBase(now: Date): { baseDate: string; baseTime: string } {
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentMinutes = hour * 60 + minute;

  // 발표 시각 (분 단위) + 10분 여유
  const baseTimes = [
    { time: '2300', minutes: 23 * 60 + 10 },
    { time: '2000', minutes: 20 * 60 + 10 },
    { time: '1700', minutes: 17 * 60 + 10 },
    { time: '1400', minutes: 14 * 60 + 10 },
    { time: '1100', minutes: 11 * 60 + 10 },
    { time: '0800', minutes: 8 * 60 + 10 },
    { time: '0500', minutes: 5 * 60 + 10 },
    { time: '0200', minutes: 2 * 60 + 10 },
  ];

  for (const bt of baseTimes) {
    if (currentMinutes >= bt.minutes) {
      return { baseDate: formatDate(now), baseTime: bt.time };
    }
  }

  // 0시~2시10분: 전날 2300 발표분
  return { baseDate: formatDate(addDays(now, -1)), baseTime: '2300' };
}

/**
 * 어제 데이터용 base 결정
 * 어제 날짜의 가장 늦은 예보(2300)를 사용하면 어제 하루치 데이터가 모두 포함
 */
function getYesterdayBase(now: Date): { baseDate: string; baseTime: string } {
  const yesterday = addDays(now, -1);
  return { baseDate: formatDate(yesterday), baseTime: '0200' };
}

async function getWeatherForDate(
  nx: number,
  ny: number,
  targetDate: string,
  baseDate: string,
  baseTime: string
): Promise<SessionWeather> {
  const cached = await getCachedWeather(nx, ny, targetDate);
  if (cached) return cached;

  const items = await getVilageFcst(nx, ny, baseDate, baseTime);
  const result = transformForecast(items, targetDate);

  await setCachedWeather(nx, ny, targetDate, result);
  return result;
}

export async function getWeatherComparison(
  nx: number,
  ny: number
): Promise<WeatherComparison> {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const todayStr = formatDate(now);
  const yesterdayStr = formatDate(addDays(now, -1));

  const todayBase = getLatestBase(now);
  const yesterdayBase = getYesterdayBase(now);

  const [todayWeather, yesterdayWeather] = await Promise.all([
    getWeatherForDate(nx, ny, todayStr, todayBase.baseDate, todayBase.baseTime),
    getWeatherForDate(nx, ny, yesterdayStr, yesterdayBase.baseDate, yesterdayBase.baseTime),
  ]);

  const delta: SessionDelta = {
    morning: calcDelta(yesterdayWeather.morning, todayWeather.morning),
    afternoon: calcDelta(yesterdayWeather.afternoon, todayWeather.afternoon),
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

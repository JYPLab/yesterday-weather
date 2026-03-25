import type { KmaItem } from './kma.js';
import type { WeatherData, SessionWeather } from 'yesterday-weather-shared';
import { calcFeelsLike } from 'yesterday-weather-shared';

interface HourlyData {
  hour: number;
  tmp: number;
  reh: number;
  wsd: number;
  pop: number;
  pty: number;
  sky: number;
}

/**
 * KMA 아이템 목록을 시간별 데이터로 그룹핑
 */
function groupByHour(items: KmaItem[]): Map<string, Map<string, string>> {
  const map = new Map<string, Map<string, string>>();
  for (const item of items) {
    const key = `${item.fcstDate}_${item.fcstTime}`;
    if (!map.has(key)) map.set(key, new Map());
    map.get(key)!.set(item.category, item.fcstValue);
  }
  return map;
}

function parseHourly(
  fcstTime: string,
  cats: Map<string, string>
): HourlyData {
  return {
    hour: parseInt(fcstTime.slice(0, 2), 10),
    tmp: parseFloat(cats.get('TMP') || cats.get('T1H') || '0'),
    reh: parseFloat(cats.get('REH') || '50'),
    wsd: parseFloat(cats.get('WSD') || '0'),
    pop: parseFloat(cats.get('POP') || '0'),
    pty: parseInt(cats.get('PTY') || '0', 10),
    sky: parseInt(cats.get('SKY') || '1', 10),
  };
}

function aggregateWeather(hourlyList: HourlyData[]): WeatherData {
  if (hourlyList.length === 0) {
    return {
      feelsLike: 0,
      tempMin: 0,
      tempMax: 0,
      rainProb: 0,
      windSpeed: 0,
      isSnow: false,
      humidity: 50,
      temperature: 0,
    };
  }

  const temps = hourlyList.map((h) => h.tmp);
  const avgTmp =
    hourlyList.reduce((s, h) => s + h.tmp, 0) / hourlyList.length;
  const avgReh =
    hourlyList.reduce((s, h) => s + h.reh, 0) / hourlyList.length;
  const avgWsd =
    hourlyList.reduce((s, h) => s + h.wsd, 0) / hourlyList.length;
  const maxPop = Math.max(...hourlyList.map((h) => h.pop));
  const hasSnow = hourlyList.some((h) => h.pty === 2 || h.pty === 3);

  return {
    feelsLike: calcFeelsLike(avgTmp, avgWsd, avgReh),
    tempMin: Math.min(...temps),
    tempMax: Math.max(...temps),
    rainProb: maxPop,
    windSpeed: Math.round(avgWsd * 10) / 10,
    isSnow: hasSnow,
    humidity: Math.round(avgReh),
    temperature: Math.round(avgTmp * 10) / 10,
  };
}

/**
 * KMA 예보 아이템 → SessionWeather 변환
 */
export function transformForecast(
  items: KmaItem[],
  targetDate: string
): SessionWeather {
  const grouped = groupByHour(items);
  const allHourly: HourlyData[] = [];

  for (const [key, cats] of grouped) {
    const [date, time] = key.split('_');
    if (date !== targetDate) continue;
    allHourly.push(parseHourly(time, cats));
  }

  const morning = allHourly.filter((h) => h.hour >= 6 && h.hour < 12);
  const afternoon = allHourly.filter(
    (h) => h.hour >= 12 && h.hour < 18
  );

  return {
    morning: aggregateWeather(morning),
    afternoon: aggregateWeather(afternoon),
    daily: aggregateWeather(allHourly),
  };
}

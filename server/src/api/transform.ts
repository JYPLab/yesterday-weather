import type { KmaItem } from './kma.js';
import type { WeatherData, SessionWeather } from 'yesterday-weather-shared';
import { calcFeelsLike } from 'yesterday-weather-shared';

interface HourlyData {
  hour: number;
  tmp: number;
  reh: number;
  wsd: number;
  pop: number;
  pty: number; // 0=없음, 1=비, 2=비/눈, 3=눈, 4=소나기
  sky: number; // 1=맑음, 3=구름많음, 4=흐림
}

/**
 * KMA 아이템 목록을 시간별 데이터로 그룹핑
 * key: "fcstDate_fcstTime" → Map<category, fcstValue>
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

/**
 * TMN(일 최저기온), TMX(일 최고기온) 추출
 * TMN은 0600 예보에, TMX는 1500 예보에 포함
 */
function extractDailyExtremes(
  items: KmaItem[],
  targetDate: string
): { tmn: number | null; tmx: number | null } {
  let tmn: number | null = null;
  let tmx: number | null = null;

  for (const item of items) {
    if (item.fcstDate !== targetDate) continue;
    if (item.category === 'TMN') {
      tmn = parseFloat(item.fcstValue);
    } else if (item.category === 'TMX') {
      tmx = parseFloat(item.fcstValue);
    }
  }

  return { tmn, tmx };
}

function parseHourly(
  fcstTime: string,
  cats: Map<string, string>
): HourlyData {
  return {
    hour: parseInt(fcstTime.slice(0, 2), 10),
    // 단기예보: TMP, 초단기실황: T1H
    tmp: parseFloat(cats.get('TMP') || cats.get('T1H') || '0'),
    reh: parseFloat(cats.get('REH') || '50'),
    wsd: parseFloat(cats.get('WSD') || '0'),
    pop: parseFloat(cats.get('POP') || '0'),
    pty: parseInt(cats.get('PTY') || '0', 10),
    sky: parseInt(cats.get('SKY') || '1', 10),
  };
}

function aggregateWeather(
  hourlyList: HourlyData[],
  tmnOverride: number | null,
  tmxOverride: number | null
): WeatherData {
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

  // PTY: 2=비/눈, 3=눈 → 눈 관련
  const hasSnow = hourlyList.some((h) => h.pty === 2 || h.pty === 3);

  // TMN/TMX가 있으면 API 공식값 사용, 없으면 시간별 TMP에서 계산
  const tempMin = tmnOverride ?? Math.min(...temps);
  const tempMax = tmxOverride ?? Math.max(...temps);

  return {
    feelsLike: calcFeelsLike(avgTmp, avgWsd, avgReh),
    tempMin,
    tempMax,
    rainProb: maxPop,
    windSpeed: Math.round(avgWsd * 10) / 10,
    isSnow: hasSnow,
    humidity: Math.round(avgReh),
    temperature: Math.round(avgTmp * 10) / 10,
  };
}

/**
 * KMA 단기예보 아이템 → SessionWeather 변환
 *
 * - 오전: 06~11시
 * - 오후: 12~17시
 * - daily: 전체 (TMN/TMX 공식값 활용)
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

  // TMN/TMX 추출 (기상청 공식 최저/최고기온)
  const { tmn, tmx } = extractDailyExtremes(items, targetDate);

  const morning = allHourly.filter((h) => h.hour >= 6 && h.hour < 12);
  const afternoon = allHourly.filter(
    (h) => h.hour >= 12 && h.hour < 18
  );

  return {
    morning: aggregateWeather(morning, null, null),
    afternoon: aggregateWeather(afternoon, null, null),
    daily: aggregateWeather(allHourly, tmn, tmx),
  };
}

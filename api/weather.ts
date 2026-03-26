import type { VercelRequest, VercelResponse } from '@vercel/node';

// ── Types ──
interface KmaItem {
  baseDate: string;
  baseTime: string;
  category: string;
  fcstDate: string;
  fcstTime: string;
  fcstValue: string;
}

interface WeatherData {
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  rainProb: number;
  windSpeed: number;
  isSnow: boolean;
  humidity: number;
  temperature: number;
}

interface SessionWeather {
  morning: WeatherData;
  afternoon: WeatherData;
  daily: WeatherData;
}

interface Delta {
  feelsLikeDelta: number;
  tempMinDelta: number;
  tempMaxDelta: number;
  windDelta: number;
  newRain: boolean;
  newSnow: boolean;
  newWind: boolean;
}

// ── Region Codes (KMA Grid) ──
const LOCATION_CODES: Record<string, { nx: number; ny: number }> = {
  '서울': { nx: 60, ny: 127 },
  '부산': { nx: 98, ny: 76 },
  '대구': { nx: 89, ny: 90 },
  '인천': { nx: 55, ny: 124 },
  '광주': { nx: 58, ny: 74 },
  '대전': { nx: 67, ny: 100 },
  '울산': { nx: 102, ny: 84 },
  '세종': { nx: 66, ny: 103 },
  '수원': { nx: 60, ny: 121 },
  '청주': { nx: 69, ny: 107 },
  '전주': { nx: 63, ny: 89 },
  '제주': { nx: 52, ny: 38 },
  '창원': { nx: 89, ny: 77 },
  '고양': { nx: 57, ny: 128 },
  '용인': { nx: 64, ny: 119 },
  '성남': { nx: 63, ny: 124 },
  '화성': { nx: 57, ny: 119 },
  '안산': { nx: 58, ny: 121 },
  '천안': { nx: 63, ny: 110 },
  '김해': { nx: 95, ny: 77 },
};

// ── Feels-Like Temperature ──
function calcFeelsLikeCold(t: number, v: number): number {
  if (v < 1.3) return t;
  const v016 = Math.pow(v * 3.6, 0.16);
  return 13.12 + 0.6215 * t - 11.37 * v016 + 0.3965 * t * v016;
}

function calcFeelsLikeHot(t: number, rh: number): number {
  const t2 = t * t, rh2 = rh * rh;
  return (
    -8.7847 + 1.6114 * t + 2.3385 * rh - 0.1461 * t * rh -
    0.0123 * t2 - 0.0164 * rh2 + 0.0022 * t2 * rh +
    0.0007 * t * rh2 - 0.0000036 * t2 * rh2
  );
}

function calcFeelsLike(tmp: number, wsd: number, reh: number): number {
  if (tmp <= 10) return Math.round(calcFeelsLikeCold(tmp, wsd) * 10) / 10;
  if (tmp >= 33) return Math.round(calcFeelsLikeHot(tmp, reh) * 10) / 10;
  return Math.round(tmp * 10) / 10;
}

// ── Delta Calculation ──
function calcDelta(yesterday: WeatherData, today: WeatherData): Delta {
  const feelsLikeDelta = today.feelsLike - yesterday.feelsLike;
  const windDelta = today.windSpeed - yesterday.windSpeed;
  return {
    feelsLikeDelta,
    tempMinDelta: today.tempMin - yesterday.tempMin,
    tempMaxDelta: today.tempMax - yesterday.tempMax,
    windDelta,
    newRain: yesterday.rainProb < 60 && today.rainProb >= 60 && !today.isSnow,
    newSnow: !yesterday.isSnow && today.isSnow && today.rainProb >= 60,
    newWind: windDelta >= 3,
  };
}

// ── Emoji & Text ──
const TEMP_EMOJI: Record<string, string> = {
  MUCH_COLDER: '🥶', COLDER: '😬', SIMILAR: '😊', WARMER: '😄', MUCH_WARMER: '🥵',
};
const WIND_EMOJI = '💨';
const RAIN_EMOJI = '🌧️';
const SNOW_EMOJI = '❄️';

function getTempKey(delta: number): string {
  if (delta <= -5) return 'MUCH_COLDER';
  if (delta <= -2) return 'COLDER';
  if (delta <= 2) return 'SIMILAR';
  if (delta <= 5) return 'WARMER';
  return 'MUCH_WARMER';
}

const TEMP_TEXT_CONNECTIVE: Record<string, string> = {
  MUCH_COLDER: '춥고', COLDER: '쌀쌀하고', SIMILAR: '비슷한데', WARMER: '따뜻하고', MUCH_WARMER: '따뜻하고',
};
const TEMP_TEXT: Record<string, string> = {
  MUCH_COLDER: '많이 추워', COLDER: '쌀쌀해', SIMILAR: '비슷해', WARMER: '따뜻해', MUCH_WARMER: '많이 따뜻해',
};

function buildEmoji(delta: Delta): string {
  const tempEmoji = TEMP_EMOJI[getTempKey(delta.feelsLikeDelta)];
  if (delta.newSnow) return tempEmoji + SNOW_EMOJI;
  if (delta.newRain) return tempEmoji + RAIN_EMOJI;
  if (delta.newWind) return tempEmoji + WIND_EMOJI;
  return tempEmoji;
}

function buildDesc(delta: Delta): string {
  const key = getTempKey(delta.feelsLikeDelta);
  if (delta.newSnow) return `${TEMP_TEXT_CONNECTIVE[key]} 눈 와요`;
  if (delta.newRain) return `${TEMP_TEXT_CONNECTIVE[key]} 비 와요`;
  if (delta.newWind) return `${TEMP_TEXT_CONNECTIVE[key]} 바람 강해요`;
  return `${TEMP_TEXT[key]}요`;
}

function buildTempSuffix(delta: Delta): string {
  const diff = Math.abs(Math.round(delta.feelsLikeDelta));
  if (diff === 0) return '비슷해요';
  return `${diff}도 ${delta.feelsLikeDelta < 0 ? '추워요' : '따뜻해요'}`;
}

// ── KMA API ──
const KMA_BASE = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0';

async function fetchForecast(
  nx: number, ny: number, baseDate: string, baseTime: string
): Promise<KmaItem[]> {
  const key = process.env.KMA_API_KEY;
  if (!key) throw new Error('KMA_API_KEY not set');

  const params = [
    `serviceKey=${key}`,
    'numOfRows=1000', 'pageNo=1', 'dataType=JSON',
    `base_date=${baseDate}`, `base_time=${baseTime}`,
    `nx=${nx}`, `ny=${ny}`,
  ];

  const url = `${KMA_BASE}/getVilageFcst?${params.join('&')}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`KMA HTTP ${res.status}`);

  const data = await res.json();
  if (data.response?.header?.resultCode !== '00') {
    throw new Error(`KMA Error: ${data.response?.header?.resultMsg || 'unknown'}`);
  }

  return data.response.body.items.item || [];
}

// ── Transform KMA → SessionWeather ──
interface HourlyData {
  hour: number; tmp: number; reh: number; wsd: number; pop: number; pty: number;
}

function transformForecast(items: KmaItem[], targetDate: string): SessionWeather {
  const grouped = new Map<string, Map<string, string>>();
  for (const item of items) {
    const key = `${item.fcstDate}_${item.fcstTime}`;
    if (!grouped.has(key)) grouped.set(key, new Map());
    grouped.get(key)!.set(item.category, item.fcstValue);
  }

  const allHourly: HourlyData[] = [];
  for (const [key, cats] of grouped) {
    const [date, time] = key.split('_');
    if (date !== targetDate) continue;
    allHourly.push({
      hour: parseInt(time.slice(0, 2), 10),
      tmp: parseFloat(cats.get('TMP') || '0'),
      reh: parseFloat(cats.get('REH') || '50'),
      wsd: parseFloat(cats.get('WSD') || '0'),
      pop: parseFloat(cats.get('POP') || '0'),
      pty: parseInt(cats.get('PTY') || '0', 10),
    });
  }

  let tmn: number | null = null, tmx: number | null = null;
  for (const item of items) {
    if (item.fcstDate !== targetDate) continue;
    if (item.category === 'TMN') tmn = parseFloat(item.fcstValue);
    if (item.category === 'TMX') tmx = parseFloat(item.fcstValue);
  }

  const aggregate = (list: HourlyData[], tmnO: number | null, tmxO: number | null): WeatherData => {
    if (list.length === 0) return { feelsLike: 0, tempMin: 0, tempMax: 0, rainProb: 0, windSpeed: 0, isSnow: false, humidity: 50, temperature: 0 };
    const temps = list.map(h => h.tmp);
    const avgT = list.reduce((s, h) => s + h.tmp, 0) / list.length;
    const avgR = list.reduce((s, h) => s + h.reh, 0) / list.length;
    const avgW = list.reduce((s, h) => s + h.wsd, 0) / list.length;
    return {
      feelsLike: calcFeelsLike(avgT, avgW, avgR),
      tempMin: tmnO ?? Math.min(...temps),
      tempMax: tmxO ?? Math.max(...temps),
      rainProb: Math.max(...list.map(h => h.pop)),
      windSpeed: Math.round(avgW * 10) / 10,
      isSnow: list.some(h => h.pty === 2 || h.pty === 3),
      humidity: Math.round(avgR),
      temperature: Math.round(avgT * 10) / 10,
    };
  };

  const morning = allHourly.filter(h => h.hour >= 6 && h.hour < 12);
  const afternoon = allHourly.filter(h => h.hour >= 12 && h.hour < 18);

  return {
    morning: aggregate(morning, null, null),
    afternoon: aggregate(afternoon, null, null),
    daily: aggregate(allHourly, tmn, tmx),
  };
}

// ── Date Helpers ──
function formatDate(d: Date): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}

function getLatestBase(now: Date): { baseDate: string; baseTime: string } {
  const cur = now.getHours() * 60 + now.getMinutes();
  const bases = [
    { time: '2300', min: 23 * 60 + 10 }, { time: '2000', min: 20 * 60 + 10 },
    { time: '1700', min: 17 * 60 + 10 }, { time: '1400', min: 14 * 60 + 10 },
    { time: '1100', min: 11 * 60 + 10 }, { time: '0800', min: 8 * 60 + 10 },
    { time: '0500', min: 5 * 60 + 10 }, { time: '0200', min: 2 * 60 + 10 },
  ];
  for (const b of bases) {
    if (cur >= b.min) return { baseDate: formatDate(now), baseTime: b.time };
  }
  return { baseDate: formatDate(addDays(now, -1)), baseTime: '2300' };
}

// ── Handler ──
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const region = (req.query.region as string) || '서울';
  const coords = LOCATION_CODES[region];

  if (!coords) {
    return res.status(400).json({ error: `지원하지 않는 지역: ${region}` });
  }

  try {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const todayStr = formatDate(now);
    const yesterdayStr = formatDate(addDays(now, -1));

    const todayBase = getLatestBase(now);
    const yesterdayBase = { baseDate: formatDate(addDays(now, -1)), baseTime: '2300' };

    const [todayItems, yesterdayItems] = await Promise.all([
      fetchForecast(coords.nx, coords.ny, todayBase.baseDate, todayBase.baseTime),
      fetchForecast(coords.nx, coords.ny, yesterdayBase.baseDate, yesterdayBase.baseTime),
    ]);

    const today = transformForecast(todayItems, todayStr);
    const yesterday = transformForecast(yesterdayItems, yesterdayStr);

    const delta = {
      morning: calcDelta(yesterday.morning, today.morning),
      afternoon: calcDelta(yesterday.afternoon, today.afternoon),
      daily: calcDelta(yesterday.daily, today.daily),
    };

    const result = {
      today,
      yesterday,
      delta,
      emoji: buildEmoji(delta.daily),
      description: buildDesc(delta.daily),
      tempSuffix: buildTempSuffix(delta.daily),
    };

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('Weather API error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

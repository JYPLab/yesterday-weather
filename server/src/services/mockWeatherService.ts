import { calcDelta, calcFeelsLike, buildEmoji, buildDesc, buildTempSuffix } from 'yesterday-weather-shared';
import type { WeatherComparison, SessionWeather, SessionDelta, WeatherData } from 'yesterday-weather-shared';

function makeWeather(
  tmp: number,
  wsd: number,
  reh: number,
  pop: number,
  isSnow: boolean
): WeatherData {
  return {
    feelsLike: calcFeelsLike(tmp, wsd, reh),
    tempMin: tmp - 3,
    tempMax: tmp + 5,
    rainProb: pop,
    windSpeed: wsd,
    isSnow,
    humidity: reh,
    temperature: tmp,
  };
}

const MOCK_SCENARIOS: Record<string, { today: SessionWeather; yesterday: SessionWeather }> = {
  '서울': {
    yesterday: {
      morning: makeWeather(8, 2, 55, 10, false),
      afternoon: makeWeather(14, 3, 50, 10, false),
      daily: makeWeather(11, 2.5, 52, 10, false),
      currentTemp: null,
    },
    today: {
      morning: makeWeather(3, 6, 60, 70, false),
      afternoon: makeWeather(9, 5, 55, 60, false),
      daily: makeWeather(6, 5.5, 58, 70, false),
      currentTemp: null,
    },
  },
  '부산': {
    yesterday: {
      morning: makeWeather(10, 3, 60, 20, false),
      afternoon: makeWeather(15, 2, 55, 10, false),
      daily: makeWeather(12, 2.5, 58, 20, false),
      currentTemp: null,
    },
    today: {
      morning: makeWeather(12, 2, 65, 10, false),
      afternoon: makeWeather(18, 1.5, 50, 5, false),
      daily: makeWeather(15, 1.8, 58, 10, false),
      currentTemp: null,
    },
  },
  '대전': {
    yesterday: {
      morning: makeWeather(7, 2, 50, 10, false),
      afternoon: makeWeather(13, 2, 45, 5, false),
      daily: makeWeather(10, 2, 48, 10, false),
      currentTemp: null,
    },
    today: {
      morning: makeWeather(2, 7, 70, 80, true),
      afternoon: makeWeather(5, 6, 65, 70, true),
      daily: makeWeather(3, 6.5, 68, 80, true),
      currentTemp: null,
    },
  },
};

// 등록 안 된 지역은 서울 기준 약간 변형
function getDefaultScenario(): { today: SessionWeather; yesterday: SessionWeather } {
  return MOCK_SCENARIOS['서울'];
}

export async function getWeatherComparisonMock(
  nx: number,
  ny: number,
  regionName?: string
): Promise<WeatherComparison> {
  const scenario = (regionName && MOCK_SCENARIOS[regionName]) || getDefaultScenario();
  const { today, yesterday } = scenario;

  const delta: SessionDelta = {
    morning: calcDelta(yesterday.morning, today.morning),
    afternoon: calcDelta(yesterday.afternoon, today.afternoon),
    daily: calcDelta(yesterday.daily, today.daily),
  };

  return {
    today,
    yesterday,
    delta,
    emoji: buildEmoji(delta.daily),
    description: buildDesc(delta.daily),
    tempSuffix: buildTempSuffix(delta.daily),
  };
}

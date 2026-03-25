export interface WeatherData {
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  rainProb: number;
  windSpeed: number;
  isSnow: boolean;
  humidity: number;
  temperature: number;
}

export interface SessionWeather {
  morning: WeatherData;   // 06~12시
  afternoon: WeatherData; // 12~18시
  daily: WeatherData;     // 하루 종합
}

export interface Delta {
  feelsLikeDelta: number;
  tempMinDelta: number;
  tempMaxDelta: number;
  windDelta: number;
  newRain: boolean;
  newSnow: boolean;
  newWind: boolean;
}

export interface SessionDelta {
  morning: Delta;
  afternoon: Delta;
  daily: Delta;
}

export interface WeatherComparison {
  today: SessionWeather;
  yesterday: SessionWeather;
  delta: SessionDelta;
  emoji: string;
  description: string;
  tempSuffix: string;
}

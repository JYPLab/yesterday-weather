import React from 'react';
import type { WeatherComparison } from 'yesterday-weather-shared';
import { getTempEmoji, buildDesc } from 'yesterday-weather-shared';

interface Props {
  data: WeatherComparison;
  location: string;
  alarmHour: number;
}

export default function WeatherCard({ data, location, alarmHour }: Props) {
  const { today, delta } = data;
  const dailyDelta = delta.daily;
  const isColder = dailyDelta.feelsLikeDelta < 0;

  return (
    <div>
      <div className="weather-header">
        <span>{location}</span>
        <span>오전 {alarmHour}시</span>
      </div>

      <div className="weather-emoji">{data.emoji}</div>

      <div className="weather-desc">{data.description}</div>

      <div className="weather-temp">
        최저 {Math.round(today.daily.tempMin)}°C / 최고{' '}
        {Math.round(today.daily.tempMax)}°C
      </div>

      <div className={`weather-delta ${isColder ? 'cold' : 'warm'}`}>
        어제보다 {data.tempSuffix}
      </div>

      <div className="session-cards">
        <div className="session-card">
          <span className="session-emoji">
            {getTempEmoji(delta.morning.feelsLikeDelta)}
          </span>
          <div>
            <div className="session-label">오전</div>
            <div className="session-text">
              어제보다 {Math.abs(Math.round(delta.morning.feelsLikeDelta))}도{' '}
              {delta.morning.feelsLikeDelta < 0 ? '추워' : delta.morning.feelsLikeDelta > 0 ? '따뜻' : '비슷'}
            </div>
          </div>
        </div>

        <div className="session-card">
          <span className="session-emoji">
            {getTempEmoji(delta.afternoon.feelsLikeDelta)}
          </span>
          <div>
            <div className="session-label">오후</div>
            <div className="session-text">
              어제보다 {Math.abs(Math.round(delta.afternoon.feelsLikeDelta))}도{' '}
              {delta.afternoon.feelsLikeDelta < 0 ? '추워' : delta.afternoon.feelsLikeDelta > 0 ? '따뜻' : '비슷'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeather } from '../hooks/useWeather';
import WeatherCard from '../components/WeatherCard';

interface Props {
  location: string;
  alarmHour: number;
}

export default function MainPage({ location, alarmHour }: Props) {
  const { data, loading, error, refetch } = useWeather(location);
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="navigation">
        <span style={{ flex: 1 }}>오늘 날씨</span>
        <span
          style={{ fontSize: 14, color: '#8b95a1', cursor: 'pointer' }}
          onClick={() => navigate('/settings')}
        >
          설정
        </span>
      </div>

      {loading && <div className="loading">날씨 정보를 불러오는 중...</div>}

      {error && (
        <div className="error">
          <span>{error}</span>
          <button onClick={refetch}>다시 시도</button>
        </div>
      )}

      {data && (
        <WeatherCard data={data} location={location} alarmHour={alarmHour} />
      )}
    </div>
  );
}

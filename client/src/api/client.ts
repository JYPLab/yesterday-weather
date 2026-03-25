import type { WeatherComparison, UserConfig } from 'yesterday-weather-shared';

const BASE = '/api';

export async function getWeather(region: string): Promise<WeatherComparison> {
  const res = await fetch(`${BASE}/weather?region=${encodeURIComponent(region)}`);
  if (!res.ok) throw new Error('날씨 정보를 불러올 수 없습니다');
  return res.json();
}

export async function getRegions(query: string = ''): Promise<Array<{ name: string; nx: number; ny: number }>> {
  const res = await fetch(`${BASE}/regions?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('지역 목록을 불러올 수 없습니다');
  return res.json();
}

export async function saveUserConfig(config: {
  userId: string;
  location: string;
  alarmHour: number;
}): Promise<void> {
  const res = await fetch(`${BASE}/user-config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error('설정 저장에 실패했습니다');
}

export async function getUserConfig(userId: string): Promise<UserConfig | null> {
  const res = await fetch(`${BASE}/user-config/${userId}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('설정을 불러올 수 없습니다');
  return res.json();
}

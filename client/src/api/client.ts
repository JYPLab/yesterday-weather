import type { WeatherComparison, UserConfig } from 'yesterday-weather-shared';
import { getMockWeather } from './mockData';

const BASE = 'https://yesterday-weather-server.vercel.app/api';

export async function getWeather(region: string): Promise<WeatherComparison | null> {
  const res = await fetch(`${BASE}/weather?region=${encodeURIComponent(region)}`);
  if (!res.ok) return null;
  return res.json();
}

export async function getRegions(query: string = ''): Promise<Array<{ name: string; nx: number; ny: number }>> {
  try {
    const res = await fetch(`${BASE}/regions?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return [];
  }
}

export async function saveUserConfig(config: {
  userId: string;
  location: string;
  alarmHour: number;
}): Promise<void> {
  try {
    const res = await fetch(`${BASE}/user-config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error();
  } catch {
    // 서버 없으면 무시 (localStorage로 처리)
  }
}

export async function tossLogin(
  authorizationCode: string,
  referrer: 'DEFAULT' | 'SANDBOX'
): Promise<string | null> {
  try {
    const res = await fetch(`${BASE}/auth/toss-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorizationCode, referrer }),
    });
    if (!res.ok) throw new Error();
    const { userKey } = await res.json();
    return userKey as string;
  } catch {
    return null;
  }
}

export async function getUserConfig(userId: string): Promise<UserConfig | null> {
  try {
    const res = await fetch(`${BASE}/user-config/${userId}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return null;
  }
}

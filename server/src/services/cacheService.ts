import { pool } from '../db/pool.js';
import type { SessionWeather } from 'yesterday-weather-shared';

export async function getCachedWeather(
  nx: number,
  ny: number,
  baseDate: string
): Promise<SessionWeather | null> {
  const result = await pool.query(
    'SELECT data FROM weather_cache WHERE nx = $1 AND ny = $2 AND base_date = $3',
    [nx, ny, baseDate]
  );
  if (result.rows.length === 0) return null;
  return result.rows[0].data as SessionWeather;
}

export async function setCachedWeather(
  nx: number,
  ny: number,
  baseDate: string,
  data: SessionWeather
): Promise<void> {
  await pool.query(
    `INSERT INTO weather_cache (nx, ny, base_date, data)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (nx, ny, base_date)
     DO UPDATE SET data = $4, fetched_at = NOW()`,
    [nx, ny, baseDate, JSON.stringify(data)]
  );
}

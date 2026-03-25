import { useState, useEffect, useCallback } from 'react';
import type { WeatherComparison } from 'yesterday-weather-shared';
import { getWeather } from '../api/client';

interface UseWeatherResult {
  data: WeatherComparison | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useWeather(region: string | null): UseWeatherResult {
  const [data, setData] = useState<WeatherComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    if (!region) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getWeather(region);
      setData(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [region]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  return { data, loading, error, refetch: fetchWeather };
}

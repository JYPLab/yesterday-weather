import { useState, useEffect } from 'react';
import { saveUserConfig } from '../api/client';

interface LocalConfig {
  userId: string;
  location: string;
  alarmHour: number;
  alarmMinute: number;
  onboarded: boolean;
}

const STORAGE_KEY = 'yesterday-weather-config';

function loadConfig(): LocalConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { alarmMinute: 0, ...parsed };
  } catch {
    return null;
  }
}

function persistConfig(config: LocalConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function useUserConfig() {
  const [config, setConfig] = useState<LocalConfig | null>(loadConfig);

  useEffect(() => {
    if (config) persistConfig(config);
  }, [config]);

  const saveConfig = (userId: string, location: string, alarmHour: number, alarmMinute: number = 0) => {
    const newConfig: LocalConfig = { userId, location, alarmHour, alarmMinute, onboarded: true };
    setConfig(newConfig);
    // 서버에도 동기화
    saveUserConfig({ userId, location, alarmHour });
  };

  const updateLocation = (location: string) => {
    if (!config) return;
    const updated = { ...config, location };
    setConfig(updated);
    saveUserConfig({ userId: config.userId, location, alarmHour: config.alarmHour });
  };

  const updateAlarmHour = (alarmHour: number, alarmMinute: number = 0) => {
    if (!config) return;
    const updated = { ...config, alarmHour, alarmMinute };
    setConfig(updated);
    saveUserConfig({ userId: config.userId, location: config.location, alarmHour });
  };

  const isOnboarded = config?.onboarded ?? false;

  return {
    config,
    isOnboarded,
    saveConfig,
    updateLocation,
    updateAlarmHour,
  };
}

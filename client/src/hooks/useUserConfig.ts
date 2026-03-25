import { useState, useEffect } from 'react';

interface LocalConfig {
  location: string;
  alarmHour: number;
  onboarded: boolean;
}

const STORAGE_KEY = 'yesterday-weather-config';

function loadConfig(): LocalConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
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

  const saveConfig = (location: string, alarmHour: number) => {
    const newConfig: LocalConfig = { location, alarmHour, onboarded: true };
    setConfig(newConfig);
  };

  const updateLocation = (location: string) => {
    if (config) {
      setConfig({ ...config, location });
    }
  };

  const updateAlarmHour = (alarmHour: number) => {
    if (config) {
      setConfig({ ...config, alarmHour });
    }
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

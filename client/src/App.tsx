import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { appLogin } from '@apps-in-toss/web-bridge';
import { useUserConfig } from './hooks/useUserConfig';
import { tossLogin } from './api/client';
import OnboardingRegionPage from './pages/OnboardingRegionPage';
import OnboardingTimePage from './pages/OnboardingTimePage';
import MainPage from './pages/MainPage';
import SettingsPage from './pages/SettingsPage';
import TermsPage from './pages/TermsPage';

export default function App() {
  const { config, isOnboarded, saveConfig, updateLocation, updateAlarmHour } =
    useUserConfig();
  const [selectedRegion, setSelectedRegion] = useState('');

  const handleOnboardingComplete = async (hour: number, minute: number) => {
    try {
      const { authorizationCode, referrer } = await appLogin();
      const userKey = await tossLogin(authorizationCode, referrer);
      if (userKey) {
        saveConfig(userKey, selectedRegion, hour, minute);
        return;
      }
    } catch (e) {
      console.warn('Toss login failed, saving without userId:', e);
    }
    // 로그인 실패 시에도 로컬 저장은 허용 (개발 환경 등)
    saveConfig('anonymous', selectedRegion, hour, minute);
  };

  if (!isOnboarded) {
    return (
      <Routes>
        <Route
          path="/onboarding/region"
          element={<OnboardingRegionPage onSelectRegion={setSelectedRegion} />}
        />
        <Route
          path="/onboarding/time"
          element={
            <OnboardingTimePage
              selectedRegion={selectedRegion}
              onComplete={handleOnboardingComplete}
            />
          }
        />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="*" element={<Navigate to="/onboarding/region" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<MainPage location={config!.location} alarmHour={config!.alarmHour} alarmMinute={config!.alarmMinute} />}
      />
      <Route
        path="/settings"
        element={
          <SettingsPage
            location={config!.location}
            alarmHour={config!.alarmHour}
            alarmMinute={config!.alarmMinute}
            onChangeLocation={updateLocation}
            onChangeAlarmHour={updateAlarmHour}
          />
        }
      />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

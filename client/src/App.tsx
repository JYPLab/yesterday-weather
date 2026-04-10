import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUserConfig } from './hooks/useUserConfig';
import OnboardingRegionPage from './pages/OnboardingRegionPage';
import OnboardingTimePage from './pages/OnboardingTimePage';
import MainPage from './pages/MainPage';
import SettingsPage from './pages/SettingsPage';
import TermsPage from './pages/TermsPage';

export default function App() {
  const { config, isOnboarded, saveConfig, updateLocation, updateAlarmHour } =
    useUserConfig();
  const [selectedRegion, setSelectedRegion] = useState('');

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
              onComplete={(hour, minute) => saveConfig(selectedRegion, hour, minute)}
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

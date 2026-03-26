import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchRegions } from 'yesterday-weather-shared';
import TopAppBar from '../components/TopAppBar';
import BottomNav from '../components/BottomNav';
import Icon from '../components/Icon';

interface Props {
  location: string;
  alarmHour: number;
  onChangeLocation: (location: string) => void;
  onChangeAlarmHour: (hour: number) => void;
}

export default function SettingsPage({
  location,
  alarmHour,
  onChangeLocation,
  onChangeAlarmHour,
}: Props) {
  const navigate = useNavigate();
  const [editingField, setEditingField] = useState<'region' | 'time' | null>(null);
  const [query, setQuery] = useState('');

  const ampm = alarmHour < 12 ? '오전' : '오후';
  const displayHour = alarmHour === 0 ? 12 : alarmHour > 12 ? alarmHour - 12 : alarmHour;

  // Region editing sub-screen
  if (editingField === 'region') {
    const results = searchRegions(query);
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <TopAppBar title="지역 변경" showBack onBack={() => setEditingField(null)} />
        <div className="pt-28 px-8">
          <div className="relative flex items-center group mb-6">
            <Icon name="search" className="absolute left-4 text-outline group-focus-within:text-primary transition-colors" />
            <input
              className="w-full bg-surface-container-high border-none rounded-full py-4 pl-12 pr-6 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/10 focus:bg-surface-container-lowest transition-all duration-300 outline-none"
              placeholder="지역명으로 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-4">
            {results.map((region) => (
              <div
                key={region.name}
                onClick={() => { onChangeLocation(region.name); setEditingField(null); }}
                className="group flex items-center gap-4 p-4 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-all duration-200 active:scale-[0.98] cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                  <Icon name="location_on" className="text-on-surface-variant group-hover:text-primary transition-colors" />
                </div>
                <p className="font-bold text-on-surface text-base flex-1">{region.name}</p>
                <Icon name="chevron_right" className="text-outline text-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Time editing sub-screen
  if (editingField === 'time') {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <TopAppBar title="알림 시간 변경" showBack onBack={() => setEditingField(null)} />
        <div className="pt-28 px-8 flex-1 flex flex-col items-center justify-center">
          <div className="bg-surface-container-low rounded-[2.5rem] p-12 flex flex-col items-center space-y-4">
            <select
              value={alarmHour}
              onChange={(e) => { onChangeAlarmHour(parseInt(e.target.value, 10)); setEditingField(null); }}
              className="text-[56px] font-bold tracking-tighter text-on-surface bg-transparent border-none outline-none text-center appearance-none cursor-pointer"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {i < 12 ? '오전' : '오후'} {(i === 0 ? 12 : i > 12 ? i - 12 : i)}:00
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  }

  // Main settings screen
  return (
    <div className="min-h-screen bg-surface flex flex-col relative">
      <TopAppBar title="설정" showBack onBack={() => navigate('/')} />

      <main className="flex-1 pt-28 px-6 pb-24">
        {/* Settings Section */}
        <section className="mt-8 space-y-2">
          <h2 className="text-on-surface-variant font-headline font-bold text-xs uppercase tracking-widest px-1 mb-4">
            서비스 설정
          </h2>
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
            {/* Location */}
            <button
              onClick={() => setEditingField('region')}
              className="w-full flex items-center justify-between px-5 py-5 hover:bg-surface-container-low transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                  <Icon name="location_on" className="text-on-surface-variant" />
                </div>
                <span className="font-headline font-semibold text-[15px] text-on-surface">지역</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-on-surface-variant font-medium text-[15px]">{location}</span>
                <Icon name="chevron_right" className="text-outline text-sm" />
              </div>
            </button>

            {/* Alarm Time */}
            <button
              onClick={() => setEditingField('time')}
              className="w-full flex items-center justify-between px-5 py-5 hover:bg-surface-container-low transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                  <Icon name="notifications_active" className="text-on-surface-variant" />
                </div>
                <span className="font-headline font-semibold text-[15px] text-on-surface">알림 시간</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-on-surface-variant font-medium text-[15px]">
                  {ampm} {displayHour}:00
                </span>
                <Icon name="chevron_right" className="text-outline text-sm" />
              </div>
            </button>
          </div>
        </section>

        {/* Other Section */}
        <section className="mt-8 space-y-2">
          <h2 className="text-on-surface-variant font-headline font-bold text-xs uppercase tracking-widest px-1 mb-4">
            기타
          </h2>
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
            <div className="w-full flex items-center justify-between px-5 py-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                  <Icon name="info" className="text-on-surface-variant" />
                </div>
                <span className="font-headline font-semibold text-[15px] text-on-surface">버전 정보</span>
              </div>
              <span className="text-outline text-xs font-medium bg-surface-container px-2 py-1 rounded-full tracking-tighter">
                v1.0.0
              </span>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

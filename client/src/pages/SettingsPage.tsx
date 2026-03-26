import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchRegions } from 'yesterday-weather-shared';
import TopAppBar from '../components/TopAppBar';
import BottomNav from '../components/BottomNav';
import Icon from '../components/Icon';

interface Props {
  location: string;
  alarmHour: number;
  alarmMinute: number;
  onChangeLocation: (location: string) => void;
  onChangeAlarmHour: (hour: number, minute: number) => void;
}

export default function SettingsPage({
  location,
  alarmHour,
  alarmMinute,
  onChangeLocation,
  onChangeAlarmHour,
}: Props) {
  const navigate = useNavigate();
  const [editingField, setEditingField] = useState<'region' | 'time' | null>(null);
  const [query, setQuery] = useState('');

  // Time editing state
  const initIsAm = alarmHour < 12;
  const initH12 = alarmHour === 0 ? 12 : alarmHour > 12 ? alarmHour - 12 : alarmHour;
  const [editHour12, setEditHour12] = useState(initH12);
  const [editMinute, setEditMinute] = useState(alarmMinute ?? 0);
  const [editIsAm, setEditIsAm] = useState(initIsAm);

  const ampm = alarmHour < 12 ? '오전' : '오후';
  const displayHour = alarmHour === 0 ? 12 : alarmHour > 12 ? alarmHour - 12 : alarmHour;
  const displayMinute = String(alarmMinute ?? 0).padStart(2, '0');

  // Region editing sub-screen
  if (editingField === 'region') {
    const results = searchRegions(query);
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <TopAppBar title="지역 변경" showBack onBack={() => setEditingField(null)} />
        <div className="pt-32 px-8 pb-8">
          <div className="relative flex items-center group mb-6">
            <Icon name="search" className="absolute left-4 text-outline group-focus-within:text-primary transition-colors" />
            <input
              className="w-full bg-surface-container-high border-none rounded-full py-4 pl-12 pr-6 text-on-surface text-[17px] placeholder:text-outline focus:ring-2 focus:ring-primary/10 focus:bg-surface-container-lowest transition-all duration-300 outline-none"
              placeholder="지역명으로 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-3">
            {results.map((region) => (
              <div
                key={region.name}
                onClick={() => { onChangeLocation(region.name); setEditingField(null); }}
                className="group flex items-center gap-4 p-4 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-all duration-200 active:scale-[0.98] cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                  <Icon name="location_on" className="text-on-surface-variant group-hover:text-primary transition-colors" />
                </div>
                <p className="font-bold text-on-surface text-[17px] flex-1">{region.name}</p>
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
    const handleSaveTime = () => {
      let h24 = editHour12;
      if (!editIsAm && editHour12 !== 12) h24 = editHour12 + 12;
      if (editIsAm && editHour12 === 12) h24 = 0;
      onChangeAlarmHour(h24, editMinute);
      setEditingField(null);
    };

    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <TopAppBar title="알림 시간 변경" showBack onBack={() => setEditingField(null)} />
        <div className="pt-32 px-8 flex-1 flex flex-col items-center justify-center">
          <div className="bg-surface-container-low rounded-[2.5rem] p-10 flex flex-col items-center gap-6 w-full">
            {/* AM/PM Toggle */}
            <div className="flex bg-surface-container-highest rounded-full p-1 gap-1">
              <button
                onClick={() => setEditIsAm(true)}
                className={`px-6 py-2.5 rounded-full text-[17px] font-bold transition-all ${
                  editIsAm ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant'
                }`}
              >
                오전
              </button>
              <button
                onClick={() => setEditIsAm(false)}
                className={`px-6 py-2.5 rounded-full text-[17px] font-bold transition-all ${
                  !editIsAm ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant'
                }`}
              >
                오후
              </button>
            </div>

            {/* Hour : Minute */}
            <div className="flex items-center gap-3">
              <select
                value={editHour12}
                onChange={(e) => setEditHour12(parseInt(e.target.value, 10))}
                className="text-[52px] font-bold tracking-tighter text-on-surface bg-transparent border-none outline-none text-center appearance-none cursor-pointer w-24"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                  <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
                ))}
              </select>
              <span className="text-[44px] font-bold text-outline-variant mb-1">:</span>
              <select
                value={editMinute}
                onChange={(e) => setEditMinute(parseInt(e.target.value, 10))}
                className="text-[52px] font-bold tracking-tighter text-on-surface bg-transparent border-none outline-none text-center appearance-none cursor-pointer w-24"
              >
                {[0, 10, 20, 30, 40, 50].map((m) => (
                  <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSaveTime}
            className="mt-8 w-full h-14 bg-gradient-to-tr from-primary to-primary-container text-on-primary font-bold text-[17px] rounded-xl shadow-sm active:scale-95 transition-transform duration-200"
          >
            저장
          </button>
        </div>
      </div>
    );
  }

  // Main settings screen
  return (
    <div className="min-h-screen bg-surface flex flex-col relative">
      <TopAppBar title="설정" showBack onBack={() => navigate('/')} />

      <main className="flex-1 pt-32 px-6 pb-28">
        {/* Settings Section */}
        <section className="space-y-2">
          <h2 className="text-on-surface-variant font-headline font-bold text-[14px] uppercase tracking-widest px-1 mb-4">
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
                <span className="font-headline font-semibold text-[17px] text-on-surface">지역</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-on-surface-variant font-medium text-[17px]">{location}</span>
                <Icon name="chevron_right" className="text-outline" />
              </div>
            </button>

            {/* Alarm Time */}
            <button
              onClick={() => {
                setEditHour12(initH12);
                setEditMinute(alarmMinute ?? 0);
                setEditIsAm(initIsAm);
                setEditingField('time');
              }}
              className="w-full flex items-center justify-between px-5 py-5 hover:bg-surface-container-low transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                  <Icon name="notifications_active" className="text-on-surface-variant" />
                </div>
                <span className="font-headline font-semibold text-[17px] text-on-surface">알림 시간</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-on-surface-variant font-medium text-[17px]">
                  {ampm} {displayHour}:{displayMinute}
                </span>
                <Icon name="chevron_right" className="text-outline" />
              </div>
            </button>
          </div>
        </section>

        {/* Other Section */}
        <section className="mt-8 space-y-2">
          <h2 className="text-on-surface-variant font-headline font-bold text-[14px] uppercase tracking-widest px-1 mb-4">
            기타
          </h2>
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
            <div className="w-full flex items-center justify-between px-5 py-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                  <Icon name="info" className="text-on-surface-variant" />
                </div>
                <span className="font-headline font-semibold text-[17px] text-on-surface">버전 정보</span>
              </div>
              <span className="text-outline text-[14px] font-medium bg-surface-container px-3 py-1 rounded-full">
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

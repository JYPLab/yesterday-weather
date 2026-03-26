import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopAppBar from '../components/TopAppBar';
import Icon from '../components/Icon';

interface Props {
  selectedRegion: string;
  onComplete: (hour: number) => void;
}

export default function OnboardingTimePage({ selectedRegion, onComplete }: Props) {
  const [hour, setHour] = useState(7);
  const navigate = useNavigate();

  const handleStart = () => {
    onComplete(hour);
    navigate('/');
  };

  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const ampm = hour < 12 ? '오전' : '오후';

  return (
    <div className="min-h-screen bg-surface flex flex-col relative">
      <TopAppBar title="날씨 알림" showBack />

      <main className="flex-1 px-8 pt-28 pb-32 flex flex-col">
        {/* Hero */}
        <section className="mb-12">
          <h2 className="text-[28px] font-bold leading-tight tracking-tight text-on-surface mb-3 font-headline">
            몇 시에 알려드릴까요?
          </h2>
          <p className="text-on-surface-variant text-[17px] font-medium leading-relaxed">
            출근 전 시간을 설정해요
          </p>
        </section>

        {/* Time Picker */}
        <section className="flex-1 flex flex-col justify-center">
          <div className="bg-surface-container-low rounded-[2.5rem] p-12 flex flex-col items-center justify-center space-y-4">
            <div className="flex items-baseline space-x-3">
              <select
                value={hour}
                onChange={(e) => setHour(parseInt(e.target.value, 10))}
                className="text-[56px] font-bold tracking-tighter text-on-surface bg-transparent border-none outline-none text-center appearance-none cursor-pointer"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {String(i === 0 ? 12 : i > 12 ? i - 12 : i).padStart(2, '0')}
                  </option>
                ))}
              </select>
              <span className="text-[48px] font-bold text-outline-variant">:</span>
              <span className="text-[56px] font-bold tracking-tighter text-on-surface">00</span>
            </div>
            <div className="px-6 py-2 bg-surface-container-highest rounded-full">
              <span className="text-primary font-bold text-lg">{ampm}</span>
            </div>
          </div>

          {/* Info Card */}
          <div className="mt-8 relative overflow-hidden rounded-xl h-24 bg-surface-container-lowest flex items-center px-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
              <Icon name="light_mode" className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">기상 직후 알림</p>
              <p className="text-xs text-on-surface-variant">
                비가 오거나 기온이 급변할 때 알려드려요.
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-primary/5 rounded-full blur-2xl"></div>
          </div>
        </section>
      </main>

      {/* CTA */}
      <div className="fixed bottom-0 w-full px-6 pb-10 pt-4 bg-gradient-to-t from-surface via-surface to-transparent">
        <button
          onClick={handleStart}
          className="w-full h-16 bg-gradient-to-tr from-primary to-primary-container text-on-primary font-bold text-[17px] rounded-xl shadow-[0px_8px_24px_rgba(0,89,185,0.15)] active:scale-95 transition-transform duration-200"
        >
          시작하기
        </button>
      </div>
    </div>
  );
}

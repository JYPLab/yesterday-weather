import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopAppBar from '../components/TopAppBar';
import Icon from '../components/Icon';

interface Props {
  selectedRegion: string;
  onComplete: (hour: number, minute: number) => Promise<void>;
}

export default function OnboardingTimePage({ selectedRegion, onComplete }: Props) {
  const [hour12, setHour12] = useState(7);
  const [minute, setMinute] = useState(0);
  const [isAm, setIsAm] = useState(true);
  const navigate = useNavigate();

  const handleStart = () => {
    let h24 = hour12;
    if (!isAm && hour12 !== 12) h24 = hour12 + 12;
    if (isAm && hour12 === 12) h24 = 0;
    onComplete(h24, minute);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col relative">
      <TopAppBar title="날씨 알림" showBack />

      <main className="flex-1 px-8 pt-4 pb-32 flex flex-col">
        {/* Hero */}
        <section className="mb-10">
          <h2 className="text-[28px] font-bold leading-tight tracking-tight text-on-surface mb-3 font-headline">
            몇 시에 알려드릴까요?
          </h2>
          <p className="text-on-surface-variant text-[17px] font-medium leading-relaxed">
            출근 전 시간을 설정해요
          </p>
        </section>

        {/* Time Picker */}
        <section className="flex-1 flex flex-col justify-center">
          <div className="bg-surface-container-low rounded-[2.5rem] p-10 flex flex-col items-center justify-center gap-6">
            {/* AM/PM Toggle */}
            <div className="flex bg-surface-container-highest rounded-full p-1 gap-1">
              <button
                onClick={() => setIsAm(true)}
                className={`px-6 py-2.5 rounded-full text-[17px] font-bold transition-all ${
                  isAm
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant'
                }`}
              >
                오전
              </button>
              <button
                onClick={() => setIsAm(false)}
                className={`px-6 py-2.5 rounded-full text-[17px] font-bold transition-all ${
                  !isAm
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant'
                }`}
              >
                오후
              </button>
            </div>

            {/* Hour : Minute */}
            <div className="flex items-center gap-3">
              <select
                value={hour12}
                onChange={(e) => setHour12(parseInt(e.target.value, 10))}
                className="text-[52px] font-bold tracking-tighter text-on-surface bg-transparent border-none outline-none text-center appearance-none cursor-pointer w-24"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, '0')}
                  </option>
                ))}
              </select>
              <span className="text-[44px] font-bold text-outline-variant mb-1">:</span>
              <select
                value={minute}
                onChange={(e) => setMinute(parseInt(e.target.value, 10))}
                className="text-[52px] font-bold tracking-tighter text-on-surface bg-transparent border-none outline-none text-center appearance-none cursor-pointer w-24"
              >
                {[0, 10, 20, 30, 40, 50].map((m) => (
                  <option key={m} value={m}>
                    {String(m).padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Info Card */}
          <div className="mt-8 relative overflow-hidden rounded-xl bg-surface-container-lowest flex items-center px-6 py-5">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
              <Icon name="light_mode" className="text-primary" />
            </div>
            <div>
              <p className="text-[16px] font-semibold text-on-surface">기상 직후 알림</p>
              <p className="text-[14px] text-on-surface-variant mt-0.5">
                비가 오거나 기온이 급변할 때 알려드려요
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* CTA */}
      <div 
        className="fixed bottom-0 w-full px-6 pt-4 bg-gradient-to-t from-surface via-surface to-transparent"
        style={{ paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom))' }}
      >
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

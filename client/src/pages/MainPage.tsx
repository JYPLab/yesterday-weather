import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeather } from '../hooks/useWeather';
import { getTempEmoji } from 'yesterday-weather-shared';
import TopAppBar from '../components/TopAppBar';
import BottomNav from '../components/BottomNav';
import Icon from '../components/Icon';

interface Props {
  location: string;
  alarmHour: number;
}

export default function MainPage({ location, alarmHour }: Props) {
  const { data, loading, error, refetch } = useWeather(location);
  const navigate = useNavigate();

  const ampm = alarmHour < 12 ? '오전' : '오후';
  const displayHour = alarmHour === 0 ? 12 : alarmHour > 12 ? alarmHour - 12 : alarmHour;

  return (
    <div className="min-h-screen bg-surface relative overflow-hidden pb-24">
      <TopAppBar
        title="날씨 알림"
        showBack
        trailing={
          <button
            onClick={() => navigate('/settings')}
            className="hover:bg-surface-container-low transition-colors rounded-full p-1 active:scale-95 duration-200"
          >
            <Icon name="settings" className="text-on-surface-variant" />
          </button>
        }
      />

      <main className="mt-16 px-6 pt-4">
        {/* Location Bar */}
        <div className="flex items-center gap-1.5 py-2.5 px-4 bg-surface-container-low rounded-full w-fit mb-6">
          <Icon name="location_on" className="text-sm text-outline" />
          <span className="text-on-surface-variant font-medium text-sm tracking-tight">
            {location} · {ampm} {displayHour}시 기준
          </span>
        </div>

        {loading && (
          <div className="flex items-center justify-center min-h-[300px] text-outline">
            날씨 정보를 불러오는 중...
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 text-outline">
            <span>{error}</span>
            <button
              onClick={refetch}
              className="px-5 py-2 rounded-full border border-outline-variant text-sm font-medium hover:bg-surface-container-low transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {data && (
          <>
            {/* Hero Weather Card */}
            <section className="bg-[#E3F2FD] rounded-[2rem] p-8 mb-8 relative shadow-sm">
              <div className="text-[48px] leading-none mb-4">{data.emoji}</div>
              <h2 className="font-headline font-extrabold text-[24px] text-on-surface leading-tight tracking-tight mb-3">
                {data.description}
              </h2>
              <p className="text-on-surface-variant font-medium text-[15px]">
                최저 {Math.round(data.today.daily.tempMin)}°C / 최고{' '}
                {Math.round(data.today.daily.tempMax)}°C
              </p>
              <p className="text-primary font-bold text-[15px] mt-1">
                어제보다 {data.tempSuffix}
              </p>
            </section>

            {/* Morning / Afternoon */}
            <section className="space-y-4 mb-10">
              <div className="bg-surface-container-lowest p-5 rounded-xl flex justify-between items-center transition-all active:scale-[0.98]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface-container-high rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-on-surface-variant">오전</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-on-surface font-semibold tracking-tight">
                    {getTempEmoji(data.delta.morning.feelsLikeDelta)} 어제보다{' '}
                    {Math.abs(Math.round(data.delta.morning.feelsLikeDelta))}도{' '}
                    {data.delta.morning.feelsLikeDelta < 0
                      ? '추워'
                      : data.delta.morning.feelsLikeDelta > 0
                        ? '따뜻'
                        : '비슷'}
                  </span>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-5 rounded-xl flex justify-between items-center transition-all active:scale-[0.98]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface-container-high rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-on-surface-variant">오후</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-on-surface font-semibold tracking-tight">
                    {getTempEmoji(data.delta.afternoon.feelsLikeDelta)} 어제보다{' '}
                    {Math.abs(Math.round(data.delta.afternoon.feelsLikeDelta))}도{' '}
                    {data.delta.afternoon.feelsLikeDelta < 0
                      ? '추워'
                      : data.delta.afternoon.feelsLikeDelta > 0
                        ? '따뜻'
                        : '비슷'}
                  </span>
                </div>
              </div>
            </section>

            {/* Hourly Grid */}
            <div className="grid grid-cols-3 gap-3 mb-10">
              <div className="bg-surface-container-low p-4 rounded-xl text-center">
                <span className="text-[12px] font-bold text-outline block mb-2 uppercase tracking-wider">
                  지금
                </span>
                <span className="text-lg font-extrabold text-on-surface">
                  {Math.round(data.today.morning.temperature)}°C
                </span>
              </div>
              <div className="bg-surface-container-low p-4 rounded-xl text-center">
                <span className="text-[12px] font-bold text-outline block mb-2 uppercase tracking-wider">
                  12시
                </span>
                <span className="text-lg font-extrabold text-on-surface">
                  {Math.round(data.today.afternoon.temperature)}°C
                </span>
              </div>
              <div className="bg-surface-container-low p-4 rounded-xl text-center">
                <span className="text-[12px] font-bold text-outline block mb-2 uppercase tracking-wider">
                  18시
                </span>
                <span className="text-lg font-extrabold text-on-surface">
                  {Math.round(data.today.daily.tempMax)}°C
                </span>
              </div>
            </div>

            {/* Footer */}
            <footer className="text-center">
              <p className="text-[13px] text-outline font-medium tracking-tight">
                {ampm} {displayHour}시 날씨 기준
              </p>
            </footer>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

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
  alarmMinute: number;
}

export default function MainPage({ location, alarmHour, alarmMinute }: Props) {
  const { data, loading, error, refetch } = useWeather(location);
  const navigate = useNavigate();

  const ampm = alarmHour < 12 ? '오전' : '오후';
  const displayHour = alarmHour === 0 ? 12 : alarmHour > 12 ? alarmHour - 12 : alarmHour;
  const displayMinute = String(alarmMinute ?? 0).padStart(2, '0');

  return (
    <div className="min-h-screen bg-surface relative pb-28">
      <TopAppBar
        title="날씨 알림"
        trailing={
          <button
            onClick={() => navigate('/settings')}
            className="hover:bg-surface-container-low transition-colors rounded-full p-1 active:scale-95 duration-200"
          >
            <Icon name="settings" className="text-on-surface-variant" />
          </button>
        }
      />

      <main className="pt-4 px-6">
        {/* Location Bar */}
        <div className="flex items-center gap-1.5 py-3 px-5 bg-surface-container-low rounded-full w-fit mb-6">
          <Icon name="location_on" className="text-[16px] text-outline" />
          <span className="text-on-surface-variant font-medium text-[16px] tracking-tight">
            {location} · {ampm} {displayHour}:{displayMinute} 기준
          </span>
        </div>

        {loading && (
          <div className="flex items-center justify-center min-h-[300px] text-outline text-[17px]">
            날씨 정보를 불러오는 중...
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 text-outline">
            <span className="text-[17px]">{error}</span>
            <button
              onClick={refetch}
              className="px-5 py-2 rounded-full border border-outline-variant text-[15px] font-medium hover:bg-surface-container-low transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {data && (
          <>
            {/* Hero Weather Card */}
            <section className="bg-[#E3F2FD] rounded-[2rem] p-8 mb-8 shadow-sm">
              <div className="text-[56px] mb-5" style={{ lineHeight: 1.2 }}>{data.emoji}</div>
              <h2 className="font-headline font-extrabold text-[24px] text-on-surface leading-tight tracking-tight mb-2">
                어제보다 {data.description}
              </h2>
              <p className="text-on-surface-variant font-medium text-[17px] mt-3">
                최저 {Math.round(data.today.daily.tempMin)}°C / 최고{' '}
                {Math.round(data.today.daily.tempMax)}°C
              </p>
              <p className="text-primary font-bold text-[17px] mt-1">
                어제보다 {data.tempSuffix}
              </p>
            </section>

            {/* Morning / Afternoon */}
            <section className="space-y-3 mb-10">
              {[
                { label: '오전', delta: data.delta.morning, temp: data.today.morning.temperature },
                { label: '오후', delta: data.delta.afternoon, temp: data.today.afternoon.temperature },
              ].map(({ label, delta: d, temp }) => (
                <div key={label} className="bg-surface-container-lowest p-5 rounded-xl flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-surface-container-high rounded-lg flex items-center justify-center">
                      <span className="text-[15px] font-bold text-on-surface-variant">{label}</span>
                    </div>
                    <span className="text-on-surface font-bold text-[17px]">
                      {Math.round(temp)}°C
                    </span>
                  </div>
                  <span className="text-on-surface-variant font-medium text-[15px]">
                    {getTempEmoji(d.feelsLikeDelta)}{' '}
                    {d.feelsLikeDelta === 0
                      ? '어제와 비슷'
                      : `어제보다 ${Math.abs(Math.round(d.feelsLikeDelta))}도 ${d.feelsLikeDelta < 0 ? '추워요' : '따뜻해요'}`}
                  </span>
                </div>
              ))}
            </section>

            {/* Hourly Grid */}
            <div className="grid grid-cols-3 gap-3 mb-10">
              {[
                { label: '지금', temp: data.today.morning.temperature },
                { label: '12시', temp: data.today.afternoon.temperature },
                { label: '18시', temp: data.today.daily.tempMax },
              ].map(({ label, temp }) => (
                <div key={label} className="bg-surface-container-low p-4 rounded-xl text-center">
                  <span className="text-[14px] font-bold text-outline block mb-2 tracking-wider">
                    {label}
                  </span>
                  <span className="text-[20px] font-extrabold text-on-surface">
                    {Math.round(temp)}°C
                  </span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <footer className="text-center">
              <p className="text-[15px] text-outline font-medium tracking-tight">
                {ampm} {displayHour}:{displayMinute} 날씨 기준
              </p>
            </footer>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

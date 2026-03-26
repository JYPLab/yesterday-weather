import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchRegions } from 'yesterday-weather-shared';
import TopAppBar from '../components/TopAppBar';
import Icon from '../components/Icon';

interface Props {
  onSelectRegion: (region: string) => void;
}

export default function OnboardingRegionPage({ onSelectRegion }: Props) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const results = useMemo(() => searchRegions(query), [query]);

  const handleSelect = (region: string) => {
    onSelectRegion(region);
    navigate('/onboarding/time');
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col relative">
      <TopAppBar title="날씨 알림" showBack />

      <main className="flex-1 px-8 pt-20 pb-32 flex flex-col">
        {/* Hero */}
        <section className="mb-12">
          <h2 className="text-[28px] font-bold leading-tight tracking-tight text-on-surface mb-3 font-headline">
            어느 지역 날씨를
            <br />
            알려드릴까요?
          </h2>
          <p className="text-on-surface-variant text-[17px] font-medium leading-relaxed">
            매일 아침 해당 지역 날씨를 보내드려요
          </p>
        </section>

        {/* Search Bar */}
        <section className="mb-8">
          <div className="relative flex items-center group">
            <Icon
              name="search"
              className="absolute left-4 text-outline group-focus-within:text-primary transition-colors"
            />
            <input
              className="w-full bg-surface-container-high border-none rounded-full py-4 pl-12 pr-6 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/10 focus:bg-surface-container-lowest transition-all duration-300 outline-none text-[16px]"
              placeholder="지역명으로 검색"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </section>

        {/* Region List — 검색 시에만 표시 */}
        {query.length > 0 && (
          <section className="flex-1">
            <h3 className="font-bold text-on-surface-variant text-sm tracking-wide mb-4">
              검색 결과
            </h3>

            <div className="space-y-3">
              {results.map((region) => (
                <div
                  key={region.name}
                  onClick={() => handleSelect(region.name)}
                  className="group flex items-center gap-4 p-4 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-all duration-200 active:scale-[0.98] cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                    <Icon
                      name="location_on"
                      className="text-on-surface-variant group-hover:text-primary transition-colors"
                    />
                  </div>
                  <p className="font-bold text-on-surface text-base flex-1">
                    {region.name}
                  </p>
                  <Icon name="chevron_right" className="text-outline text-lg" />
                </div>
              ))}

              {results.length === 0 && (
                <div className="text-center py-8 text-outline">
                  검색 결과가 없습니다
                </div>
              )}
            </div>
          </section>
        )}

        {/* 검색 전 빈 상태 */}
        {query.length === 0 && (
          <section className="flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Icon name="location_on" className="text-primary text-2xl" />
            </div>
            <p className="text-on-surface-variant text-sm text-center">
              시/군/구 이름을 검색해 주세요
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

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
    <div className="min-h-screen bg-surface flex flex-col relative overflow-hidden">
      <TopAppBar title="날씨 알림" showBack />

      <div className="pt-24 px-8 flex-1 pb-24">
        {/* Hero Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold font-headline text-on-surface mb-3 leading-tight">
            어느 지역 날씨를<br />알려드릴까요?
          </h2>
          <p className="text-on-surface-variant font-medium text-sm">
            매일 아침 해당 지역 날씨를 보내드려요
          </p>
        </section>

        {/* Search Bar */}
        <section className="mb-12">
          <div className="relative flex items-center group">
            <Icon
              name="search"
              className="absolute left-4 text-outline group-focus-within:text-primary transition-colors"
            />
            <input
              className="w-full bg-surface-container-high border-none rounded-full py-4 pl-12 pr-6 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/10 focus:bg-surface-container-lowest transition-all duration-300 outline-none"
              placeholder="지역명으로 검색"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </section>

        {/* Region List */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-on-surface-variant text-sm tracking-wide">
              {query ? '검색 결과' : '지역 목록'}
            </h3>
          </div>

          <div className="space-y-4">
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
                <div className="flex-1">
                  <p className="font-bold text-on-surface text-base">
                    {region.name}
                  </p>
                </div>
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
      </div>
    </div>
  );
}

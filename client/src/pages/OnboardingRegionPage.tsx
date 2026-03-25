import React from 'react';
import { useNavigate } from 'react-router-dom';
import RegionPicker from '../components/RegionPicker';

interface Props {
  onSelectRegion: (region: string) => void;
}

export default function OnboardingRegionPage({ onSelectRegion }: Props) {
  const navigate = useNavigate();

  const handleSelect = (region: string) => {
    onSelectRegion(region);
    navigate('/onboarding/time');
  };

  return (
    <div className="page">
      <div className="navigation">날씨 알림</div>
      <h1 className="title">어느 지역 날씨를<br />알려드릴까요?</h1>
      <p className="subtitle">매일 아침 해당 지역 날씨를 보내드려요</p>
      <RegionPicker onSelect={handleSelect} />
    </div>
  );
}

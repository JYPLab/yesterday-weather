import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AlarmTimePicker from '../components/AlarmTimePicker';

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

  return (
    <div className="page">
      <div className="navigation">
        <span className="navigation-back" onClick={() => navigate(-1)}>
          ←
        </span>
        날씨 알림
      </div>
      <h1 className="title">몇 시에 알려드릴까요?</h1>
      <p className="subtitle">출근 전 시간을 설정해요</p>
      <AlarmTimePicker hour={hour} onChange={setHour} />
      <button className="cta-button" onClick={handleStart}>
        시작하기
      </button>
    </div>
  );
}

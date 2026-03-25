import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegionPicker from '../components/RegionPicker';
import AlarmTimePicker from '../components/AlarmTimePicker';

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

  if (editingField === 'region') {
    return (
      <div className="page">
        <div className="navigation">
          <span className="navigation-back" onClick={() => setEditingField(null)}>
            ←
          </span>
          지역 변경
        </div>
        <h1 className="title">지역을 변경해주세요</h1>
        <RegionPicker
          onSelect={(region) => {
            onChangeLocation(region);
            setEditingField(null);
          }}
        />
      </div>
    );
  }

  if (editingField === 'time') {
    return (
      <div className="page">
        <div className="navigation">
          <span className="navigation-back" onClick={() => setEditingField(null)}>
            ←
          </span>
          알림 시간 변경
        </div>
        <h1 className="title">알림 시간을 변경해주세요</h1>
        <AlarmTimePicker
          hour={alarmHour}
          onChange={(h) => {
            onChangeAlarmHour(h);
            setEditingField(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="navigation">
        <span className="navigation-back" onClick={() => navigate('/')}>
          ←
        </span>
        설정
      </div>

      <div className="settings-section">
        <div
          className="settings-row"
          onClick={() => setEditingField('region')}
        >
          <span className="settings-label">지역</span>
          <span>
            <span className="settings-value">{location}</span>
            <span className="settings-arrow"> ›</span>
          </span>
        </div>

        <div
          className="settings-row"
          onClick={() => setEditingField('time')}
        >
          <span className="settings-label">알림 시간</span>
          <span>
            <span className="settings-value">
              {String(alarmHour).padStart(2, '0')}:00
            </span>
            <span className="settings-arrow"> ›</span>
          </span>
        </div>
      </div>
    </div>
  );
}

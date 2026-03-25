import React from 'react';

interface Props {
  hour: number;
  onChange: (hour: number) => void;
}

export default function AlarmTimePicker({ hour, onChange }: Props) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="time-picker">
      <select
        value={hour}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
      >
        {hours.map((h) => (
          <option key={h} value={h}>
            {String(h).padStart(2, '0')}
          </option>
        ))}
      </select>
      <span>:</span>
      <span style={{ background: '#f2f4f6', borderRadius: 12, padding: '12px 20px' }}>
        00
      </span>
    </div>
  );
}

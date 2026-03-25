import React, { useState, useMemo } from 'react';
import { searchRegions } from 'yesterday-weather-shared';

interface Props {
  onSelect: (regionName: string) => void;
}

export default function RegionPicker({ onSelect }: Props) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => searchRegions(query), [query]);

  return (
    <>
      <input
        className="search-input"
        type="text"
        placeholder="지역명을 검색하세요"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />
      <div style={{ marginTop: 16 }}>
        {results.map((region) => (
          <div
            key={region.name}
            className="list-row"
            onClick={() => onSelect(region.name)}
          >
            <span className="list-row-text">{region.name}</span>
          </div>
        ))}
        {results.length === 0 && (
          <div style={{ padding: '24px 0', color: '#8b95a1', textAlign: 'center' }}>
            검색 결과가 없습니다
          </div>
        )}
      </div>
    </>
  );
}

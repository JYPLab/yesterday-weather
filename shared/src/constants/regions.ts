import type { Region, RegionCode } from '../types/region.js';

export const LOCATION_CODES: Record<string, RegionCode> = {
  '서울': { nx: 60, ny: 127 },
  '부산': { nx: 98, ny: 76 },
  '대구': { nx: 89, ny: 90 },
  '인천': { nx: 55, ny: 124 },
  '광주': { nx: 58, ny: 74 },
  '대전': { nx: 67, ny: 100 },
  '울산': { nx: 102, ny: 84 },
  '세종': { nx: 66, ny: 103 },
  '수원': { nx: 60, ny: 121 },
  '청주': { nx: 69, ny: 107 },
  '전주': { nx: 63, ny: 89 },
  '제주': { nx: 52, ny: 38 },
  '창원': { nx: 89, ny: 77 },
  '고양': { nx: 57, ny: 128 },
  '용인': { nx: 64, ny: 119 },
  '성남': { nx: 63, ny: 124 },
  '화성': { nx: 57, ny: 119 },
  '안산': { nx: 58, ny: 121 },
  '천안': { nx: 63, ny: 110 },
  '김해': { nx: 95, ny: 77 },
};

export const REGIONS: Region[] = Object.entries(LOCATION_CODES).map(
  ([name, code]) => ({ name, code })
);

export function findRegion(name: string): Region | undefined {
  return REGIONS.find((r) => r.name === name);
}

export function searchRegions(query: string): Region[] {
  if (!query) return REGIONS;
  return REGIONS.filter((r) => r.name.includes(query));
}

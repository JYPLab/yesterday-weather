import { config } from '../config.js';

const KMA_BASE =
  'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0';

export interface KmaItem {
  baseDate: string;
  baseTime: string;
  category: string;
  fcstDate: string;
  fcstTime: string;
  fcstValue: string;
  nx: number;
  ny: number;
}

export interface KmaResponse {
  response: {
    header: { resultCode: string; resultMsg: string };
    body: {
      items: { item: KmaItem[] };
      totalCount: number;
    };
  };
}

/**
 * 단기예보 조회
 * base_time: 0200, 0500, 0800, 1100, 1400, 1700, 2000, 2300
 */
export async function getVilageFcst(
  nx: number,
  ny: number,
  baseDate: string,
  baseTime: string = '0500'
): Promise<KmaItem[]> {
  const params = new URLSearchParams({
    serviceKey: config.kmaApiKey,
    numOfRows: '1000',
    pageNo: '1',
    dataType: 'JSON',
    base_date: baseDate,
    base_time: baseTime,
    nx: String(nx),
    ny: String(ny),
  });

  const url = `${KMA_BASE}/getVilageFcst?${params}`;
  const res = await fetch(url);
  const data: KmaResponse = await res.json();

  if (data.response.header.resultCode !== '00') {
    throw new Error(
      `KMA API error: ${data.response.header.resultMsg}`
    );
  }

  return data.response.body.items.item;
}

/**
 * 초단기실황 조회 (어제 데이터용)
 */
export async function getUltraSrtNcst(
  nx: number,
  ny: number,
  baseDate: string,
  baseTime: string = '0600'
): Promise<KmaItem[]> {
  const params = new URLSearchParams({
    serviceKey: config.kmaApiKey,
    numOfRows: '100',
    pageNo: '1',
    dataType: 'JSON',
    base_date: baseDate,
    base_time: baseTime,
    nx: String(nx),
    ny: String(ny),
  });

  const url = `${KMA_BASE}/getUltraSrtNcst?${params}`;
  const res = await fetch(url);
  const data: KmaResponse = await res.json();

  if (data.response.header.resultCode !== '00') {
    throw new Error(
      `KMA API error: ${data.response.header.resultMsg}`
    );
  }

  return data.response.body.items.item;
}

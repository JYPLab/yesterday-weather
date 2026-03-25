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
 * 기상청 카테고리 코드 참고:
 * - TMP : 1시간 기온 (°C)
 * - TMN : 일 최저기온 (°C) — 0600 발표 시에만
 * - TMX : 일 최고기온 (°C) — 1500 발표 시에만
 * - SKY : 하늘상태 (1=맑음, 3=구름많음, 4=흐림)
 * - PTY : 강수형태 (0=없음, 1=비, 2=비/눈, 3=눈, 4=소나기)
 * - POP : 강수확률 (%)
 * - PCP : 1시간 강수량 (mm, "강수없음" 포함)
 * - SNO : 1시간 신적설 (cm, "적설없음" 포함)
 * - REH : 습도 (%)
 * - WSD : 풍속 (m/s)
 * - VEC : 풍향 (deg)
 * - UUU : 동서 풍속 (m/s)
 * - VVV : 남북 풍속 (m/s)
 * - WAV : 파고 (M)
 *
 * 단기예보 base_time 발표시각:
 * 0200, 0500, 0800, 1100, 1400, 1700, 2000, 2300
 * (각 발표 ~10분 후 API 제공)
 */

/**
 * 단기예보 조회 (오늘 + 내일 + 모레 예보)
 * base_time: 0200, 0500, 0800, 1100, 1400, 1700, 2000, 2300
 */
export async function getVilageFcst(
  nx: number,
  ny: number,
  baseDate: string,
  baseTime: string = '0500'
): Promise<KmaItem[]> {
  // serviceKey는 이미 디코딩된 상태로 들어오므로 수동으로 URL 구성
  // URLSearchParams가 이중 인코딩하는 문제 방지
  const queryParts = [
    `serviceKey=${config.kmaApiKey}`,
    'numOfRows=1000',
    'pageNo=1',
    'dataType=JSON',
    `base_date=${baseDate}`,
    `base_time=${baseTime}`,
    `nx=${nx}`,
    `ny=${ny}`,
  ];

  const url = `${KMA_BASE}/getVilageFcst?${queryParts.join('&')}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`KMA API HTTP error: ${res.status}`);
  }

  const data: KmaResponse = await res.json();

  if (data.response.header.resultCode !== '00') {
    throw new Error(
      `KMA API error: ${data.response.header.resultCode} ${data.response.header.resultMsg}`
    );
  }

  return data.response.body.items.item;
}

/**
 * 초단기실황 조회
 * 매시 정시 관측값 (base_time: 정시 "HH00")
 *
 * 카테고리: T1H(기온), RN1(1시간강수량), UUU, VVV, REH, PTY, VEC, WSD
 * 주의: POP, SKY, TMN, TMX는 없음 — 실황이므로 관측값만 제공
 */
export async function getUltraSrtNcst(
  nx: number,
  ny: number,
  baseDate: string,
  baseTime: string = '0600'
): Promise<KmaItem[]> {
  const queryParts = [
    `serviceKey=${config.kmaApiKey}`,
    'numOfRows=100',
    'pageNo=1',
    'dataType=JSON',
    `base_date=${baseDate}`,
    `base_time=${baseTime}`,
    `nx=${nx}`,
    `ny=${ny}`,
  ];

  const url = `${KMA_BASE}/getUltraSrtNcst?${queryParts.join('&')}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`KMA API HTTP error: ${res.status}`);
  }

  const data: KmaResponse = await res.json();

  if (data.response.header.resultCode !== '00') {
    throw new Error(
      `KMA API error: ${data.response.header.resultCode} ${data.response.header.resultMsg}`
    );
  }

  return data.response.body.items.item;
}

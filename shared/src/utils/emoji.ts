import { TEMP_EMOJI, CONDITION_EMOJI, TEMP_TEXT, TEMP_TEXT_CONNECTIVE } from '../constants/emoji.js';
import type { Delta } from '../types/weather.js';

type TempLevel = 'MUCH_COLDER' | 'COLDER' | 'SIMILAR' | 'WARMER' | 'MUCH_WARMER';

/**
 * 체감온도 델타 → 기온 레벨
 * 양수 = 어제보다 추움 (오늘 체감온도가 어제보다 높으면 어제가 더 추웠던 것)
 * 스펙 기준: delta > 0 → 오늘이 더 춥다 (어제 대비)
 * 주의: feelsLikeDelta = today - yesterday
 *   today < yesterday → delta < 0 → 오늘이 더 추움
 *   BUT 스펙의 델타 테이블은 "+5도 초과 = 많이 추워요"
 *   스펙에서 delta = 어제 - 오늘 (어제가 기준)
 *   여기선 feelsLikeDelta = today - yesterday 이므로 부호 반전
 */
export function getTempLevel(feelsLikeDelta: number): TempLevel {
  // 스펙: 양수 = 추워짐 → 실제로는 today - yesterday 가 음수일 때 추워진 것
  const delta = -feelsLikeDelta; // 어제 대비 오늘 얼마나 추워졌나
  if (delta > 5) return 'MUCH_COLDER';
  if (delta > 2) return 'COLDER';
  if (delta >= -2) return 'SIMILAR';
  if (delta >= -5) return 'WARMER';
  return 'MUCH_WARMER';
}

export function getTempEmoji(feelsLikeDelta: number): string {
  return TEMP_EMOJI[getTempLevel(feelsLikeDelta)];
}

export function getTempText(feelsLikeDelta: number): string {
  return TEMP_TEXT[getTempLevel(feelsLikeDelta)];
}

/**
 * 이모지 조합: 기온 1순위, 강수 > 바람 2순위. 최대 2개.
 */
export function buildEmoji(delta: Delta): string {
  let emoji = getTempEmoji(delta.feelsLikeDelta);

  if (delta.newSnow) emoji += '⛄️';
  else if (delta.newRain) emoji += '☂️';
  else if (delta.newWind) emoji += '🌬️';

  return emoji;
}

export function getTempConnective(feelsLikeDelta: number): string {
  return TEMP_TEXT_CONNECTIVE[getTempLevel(feelsLikeDelta)];
}

/**
 * 알림 텍스트 설명 부분
 */
export function buildDesc(delta: Delta): string {
  if (delta.newSnow) return `${getTempConnective(delta.feelsLikeDelta)} 눈 와요`;
  if (delta.newRain) return `${getTempConnective(delta.feelsLikeDelta)} 비 와요`;
  if (delta.newWind) return `${getTempConnective(delta.feelsLikeDelta)} 바람 강해요`;
  return `${getTempText(delta.feelsLikeDelta)}요`;
}

/**
 * 기온 접미사: 추우면 최저기온 델타, 따뜻하면 최고기온 델타
 */
export function buildTempSuffix(delta: Delta): string {
  // feelsLikeDelta < 0 이면 오늘이 더 추움
  if (delta.feelsLikeDelta < 0) {
    const d = Math.round(delta.tempMinDelta);
    return `최저 ${d > 0 ? '+' : ''}${d}도`;
  }
  if (delta.feelsLikeDelta > 0) {
    const d = Math.round(delta.tempMaxDelta);
    return `최고 ${d > 0 ? '+' : ''}${d}도`;
  }
  // 비슷
  const d = Math.round(delta.tempMinDelta);
  return `최저 ${d > 0 ? '+' : ''}${d}도`;
}

/**
 * 전체 푸시 텍스트 빌더
 */
export function buildPushText(delta: Delta): string {
  const emoji = buildEmoji(delta);
  const desc = buildDesc(delta);
  const temp = buildTempSuffix(delta);
  return `${emoji} ${desc}  ${temp}`;
}

/**
 * 저온 체감온도 (10°C 이하, 풍속 기반)
 * Wind Chill Index — 캐나다/미국 공동 공식
 */
export function calcFeelsLikeCold(tmp: number, wsd: number): number {
  if (wsd < 1.3) return tmp;
  return (
    13.12 +
    0.6215 * tmp -
    11.37 * Math.pow(wsd, 0.16) +
    0.3965 * Math.pow(wsd, 0.16) * tmp
  );
}

/**
 * 고온 체감온도 (33°C 이상, 습도 기반)
 * 일본 기상청 간이 Heat Index
 */
export function calcFeelsLikeHot(tmp: number, reh: number): number {
  return (
    -0.2442 +
    0.55399 * tmp +
    0.45535 * reh -
    0.0022 * tmp * reh +
    0.00278 * tmp +
    3.0
  );
}

/**
 * 기온에 따라 적절한 체감온도 계산
 * - ≤10°C: Wind Chill (바람이 세면 더 춥게 느낌)
 * - 10~33°C: 기온 그대로 (별도 보정 불필요 구간)
 * - ≥33°C: Heat Index (습도가 높으면 더 덥게 느낌)
 */
export function calcFeelsLike(
  tmp: number,
  wsd: number,
  reh: number
): number {
  if (tmp <= 10) {
    return Math.round(calcFeelsLikeCold(tmp, wsd) * 10) / 10;
  }
  if (tmp >= 33) {
    return Math.round(calcFeelsLikeHot(tmp, reh) * 10) / 10;
  }
  return Math.round(tmp * 10) / 10;
}

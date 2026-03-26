import { describe, it, expect } from 'vitest';
import {
  getTempEmoji,
  getTempLevel,
  buildEmoji,
  buildDesc,
  buildTempSuffix,
  buildPushText,
} from '../utils/emoji.js';
import type { Delta } from '../types/weather.js';

const baseDelta: Delta = {
  feelsLikeDelta: 0,
  tempMinDelta: 0,
  tempMaxDelta: 0,
  windDelta: 0,
  newRain: false,
  newSnow: false,
  newWind: false,
};

describe('getTempLevel', () => {
  it('much colder (delta < -5)', () => {
    expect(getTempLevel(-6)).toBe('MUCH_COLDER');
  });

  it('colder (-5 to -2)', () => {
    expect(getTempLevel(-3)).toBe('COLDER');
  });

  it('similar (-2 to +2)', () => {
    expect(getTempLevel(0)).toBe('SIMILAR');
    expect(getTempLevel(1)).toBe('SIMILAR');
    expect(getTempLevel(-1)).toBe('SIMILAR');
  });

  it('warmer (+2 to +5)', () => {
    expect(getTempLevel(3)).toBe('WARMER');
  });

  it('much warmer (> +5)', () => {
    expect(getTempLevel(6)).toBe('MUCH_WARMER');
  });
});

describe('getTempEmoji', () => {
  it('returns ❄️ for much colder', () => {
    expect(getTempEmoji(-6)).toBe('❄️');
  });

  it('returns 😊 for similar', () => {
    expect(getTempEmoji(0)).toBe('😊');
  });

  it('returns ☀️ for much warmer', () => {
    expect(getTempEmoji(6)).toBe('☀️');
  });
});

describe('buildEmoji', () => {
  it('returns only temp emoji when no conditions', () => {
    const delta = { ...baseDelta, feelsLikeDelta: -6 };
    expect(buildEmoji(delta)).toBe('❄️');
  });

  it('adds snow emoji', () => {
    const delta = { ...baseDelta, feelsLikeDelta: -6, newSnow: true };
    expect(buildEmoji(delta)).toBe('❄️⛄️');
  });

  it('adds rain emoji', () => {
    const delta = { ...baseDelta, feelsLikeDelta: 0, newRain: true };
    expect(buildEmoji(delta)).toBe('😊☂️');
  });

  it('adds wind emoji', () => {
    const delta = { ...baseDelta, feelsLikeDelta: -6, newWind: true };
    expect(buildEmoji(delta)).toBe('❄️🌬️');
  });

  it('prioritizes snow over rain and wind', () => {
    const delta = {
      ...baseDelta,
      feelsLikeDelta: -3,
      newSnow: true,
      newRain: true,
      newWind: true,
    };
    expect(buildEmoji(delta)).toBe('🥶⛄️');
  });

  it('prioritizes rain over wind', () => {
    const delta = {
      ...baseDelta,
      feelsLikeDelta: 0,
      newRain: true,
      newWind: true,
    };
    expect(buildEmoji(delta)).toBe('😊☂️');
  });
});

describe('buildDesc', () => {
  it('returns temp text only when no conditions', () => {
    const delta = { ...baseDelta, feelsLikeDelta: 6 };
    expect(buildDesc(delta)).toBe('많이 따뜻해요');
  });

  it('includes rain with correct grammar', () => {
    const delta = { ...baseDelta, feelsLikeDelta: -3, newRain: true };
    expect(buildDesc(delta)).toBe('쌀쌀하고 비 와요');
  });

  it('includes wind with correct grammar', () => {
    const delta = { ...baseDelta, feelsLikeDelta: -6, newWind: true };
    expect(buildDesc(delta)).toBe('춥고 바람 강해요');
  });

  it('includes snow with correct grammar', () => {
    const delta = { ...baseDelta, feelsLikeDelta: -6, newSnow: true };
    expect(buildDesc(delta)).toBe('춥고 눈 와요');
  });

  it('similar + rain', () => {
    const delta = { ...baseDelta, feelsLikeDelta: 0, newRain: true };
    expect(buildDesc(delta)).toBe('비슷한데 비 와요');
  });
});

describe('buildTempSuffix', () => {
  it('shows min temp delta when colder', () => {
    const delta = { ...baseDelta, feelsLikeDelta: -5, tempMinDelta: -3 };
    expect(buildTempSuffix(delta)).toBe('최저 -3도');
  });

  it('shows max temp delta when warmer', () => {
    const delta = { ...baseDelta, feelsLikeDelta: 5, tempMaxDelta: 4 };
    expect(buildTempSuffix(delta)).toBe('최고 +4도');
  });

  it('shows min temp delta when similar', () => {
    const delta = { ...baseDelta, feelsLikeDelta: 0, tempMinDelta: 1 };
    expect(buildTempSuffix(delta)).toBe('최저 +1도');
  });
});

describe('buildPushText', () => {
  it('builds full push text for cold + wind', () => {
    const delta: Delta = {
      feelsLikeDelta: -6,
      tempMinDelta: -5,
      tempMaxDelta: -3,
      windDelta: 4,
      newRain: false,
      newSnow: false,
      newWind: true,
    };
    const text = buildPushText(delta);
    expect(text).toContain('❄️');
    expect(text).toContain('🌬️');
    expect(text).toContain('바람 강해요');
    expect(text).toContain('최저 -5도');
  });

  it('builds full push text for warm', () => {
    const delta: Delta = {
      ...baseDelta,
      feelsLikeDelta: 6,
      tempMaxDelta: 4,
    };
    const text = buildPushText(delta);
    expect(text).toContain('☀️');
    expect(text).toContain('많이 따뜻해요');
    expect(text).toContain('최고 +4도');
  });
});

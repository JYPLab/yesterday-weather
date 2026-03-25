export const TEMP_EMOJI = {
  MUCH_COLDER: '❄️',
  COLDER: '🥶',
  SIMILAR: '😊',
  WARMER: '🌤️',
  MUCH_WARMER: '☀️',
} as const;

export const CONDITION_EMOJI = {
  RAIN: '☂️',
  SNOW: '⛄️',
  WIND: '🌬️',
} as const;

export const TEMP_TEXT: Record<string, string> = {
  MUCH_COLDER: '많이 추워',
  COLDER: '쌀쌀해',
  SIMILAR: '비슷해',
  WARMER: '따뜻해',
  MUCH_WARMER: '많이 따뜻해',
};

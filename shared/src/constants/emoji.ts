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

// 단독 사용: "~요" 붙여서 "많이 추워요"
export const TEMP_TEXT: Record<string, string> = {
  MUCH_COLDER: '많이 추워',
  COLDER: '쌀쌀해',
  SIMILAR: '비슷해',
  WARMER: '따뜻해',
  MUCH_WARMER: '많이 따뜻해',
};

// 연결형: "~고" 붙여서 "많이 춥고 비 와요"
export const TEMP_TEXT_CONNECTIVE: Record<string, string> = {
  MUCH_COLDER: '춥고',
  COLDER: '쌀쌀하고',
  SIMILAR: '비슷한데',
  WARMER: '따뜻하고',
  MUCH_WARMER: '따뜻하고',
};

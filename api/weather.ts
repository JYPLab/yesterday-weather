import type { VercelRequest, VercelResponse } from '@vercel/node';

// ── Types ──
interface KmaItem {
  baseDate: string;
  baseTime: string;
  category: string;
  fcstDate: string;
  fcstTime: string;
  fcstValue: string;
}

interface WeatherData {
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  rainProb: number;
  windSpeed: number;
  isSnow: boolean;
  humidity: number;
  temperature: number;
}

interface SessionWeather {
  morning: WeatherData;
  afternoon: WeatherData;
  daily: WeatherData;
}

interface Delta {
  feelsLikeDelta: number;
  tempMinDelta: number;
  tempMaxDelta: number;
  windDelta: number;
  newRain: boolean;
  newSnow: boolean;
  newWind: boolean;
}

// ── Region Codes (KMA Grid) ──
const LOCATION_CODES: Record<string, { nx: number; ny: number }> = {
  // 서울특별시
  '서울특별시 종로구': { nx: 60, ny: 127 },
  '서울특별시 중구': { nx: 60, ny: 127 },
  '서울특별시 용산구': { nx: 60, ny: 126 },
  '서울특별시 성동구': { nx: 61, ny: 127 },
  '서울특별시 광진구': { nx: 62, ny: 126 },
  '서울특별시 동대문구': { nx: 61, ny: 127 },
  '서울특별시 중랑구': { nx: 62, ny: 128 },
  '서울특별시 성북구': { nx: 61, ny: 127 },
  '서울특별시 강북구': { nx: 61, ny: 128 },
  '서울특별시 도봉구': { nx: 61, ny: 129 },
  '서울특별시 노원구': { nx: 61, ny: 129 },
  '서울특별시 은평구': { nx: 59, ny: 127 },
  '서울특별시 서대문구': { nx: 59, ny: 127 },
  '서울특별시 마포구': { nx: 59, ny: 127 },
  '서울특별시 양천구': { nx: 58, ny: 126 },
  '서울특별시 강서구': { nx: 58, ny: 126 },
  '서울특별시 구로구': { nx: 58, ny: 125 },
  '서울특별시 금천구': { nx: 59, ny: 124 },
  '서울특별시 영등포구': { nx: 58, ny: 126 },
  '서울특별시 동작구': { nx: 59, ny: 125 },
  '서울특별시 관악구': { nx: 59, ny: 125 },
  '서울특별시 서초구': { nx: 61, ny: 125 },
  '서울특별시 강남구': { nx: 61, ny: 126 },
  '서울특별시 송파구': { nx: 62, ny: 126 },
  '서울특별시 강동구': { nx: 62, ny: 126 },
  // 부산광역시
  '부산광역시 중구': { nx: 97, ny: 74 },
  '부산광역시 서구': { nx: 97, ny: 74 },
  '부산광역시 동구': { nx: 98, ny: 75 },
  '부산광역시 영도구': { nx: 98, ny: 74 },
  '부산광역시 부산진구': { nx: 98, ny: 75 },
  '부산광역시 동래구': { nx: 99, ny: 76 },
  '부산광역시 남구': { nx: 98, ny: 75 },
  '부산광역시 북구': { nx: 96, ny: 76 },
  '부산광역시 해운대구': { nx: 100, ny: 76 },
  '부산광역시 사하구': { nx: 96, ny: 74 },
  '부산광역시 금정구': { nx: 99, ny: 77 },
  '부산광역시 강서구': { nx: 96, ny: 76 },
  '부산광역시 연제구': { nx: 99, ny: 75 },
  '부산광역시 수영구': { nx: 100, ny: 75 },
  '부산광역시 사상구': { nx: 97, ny: 75 },
  '부산광역시 기장군': { nx: 101, ny: 77 },
  // 대구광역시
  '대구광역시 중구': { nx: 89, ny: 90 },
  '대구광역시 동구': { nx: 90, ny: 91 },
  '대구광역시 서구': { nx: 88, ny: 90 },
  '대구광역시 남구': { nx: 89, ny: 89 },
  '대구광역시 북구': { nx: 89, ny: 91 },
  '대구광역시 수성구': { nx: 90, ny: 89 },
  '대구광역시 달서구': { nx: 87, ny: 88 },
  '대구광역시 달성군': { nx: 86, ny: 88 },
  // 인천광역시
  '인천광역시 중구': { nx: 54, ny: 125 },
  '인천광역시 동구': { nx: 55, ny: 124 },
  '인천광역시 미추홀구': { nx: 54, ny: 124 },
  '인천광역시 연수구': { nx: 55, ny: 123 },
  '인천광역시 남동구': { nx: 56, ny: 124 },
  '인천광역시 부평구': { nx: 56, ny: 125 },
  '인천광역시 계양구': { nx: 57, ny: 126 },
  '인천광역시 서구': { nx: 55, ny: 126 },
  '인천광역시 강화군': { nx: 51, ny: 130 },
  '인천광역시 옹진군': { nx: 52, ny: 121 },
  // 광주광역시
  '광주광역시 동구': { nx: 59, ny: 74 },
  '광주광역시 서구': { nx: 57, ny: 74 },
  '광주광역시 남구': { nx: 58, ny: 73 },
  '광주광역시 북구': { nx: 59, ny: 75 },
  '광주광역시 광산구': { nx: 57, ny: 75 },
  // 대전광역시
  '대전광역시 동구': { nx: 68, ny: 100 },
  '대전광역시 중구': { nx: 67, ny: 100 },
  '대전광역시 서구': { nx: 67, ny: 100 },
  '대전광역시 유성구': { nx: 67, ny: 101 },
  '대전광역시 대덕구': { nx: 68, ny: 101 },
  // 울산광역시
  '울산광역시 중구': { nx: 102, ny: 84 },
  '울산광역시 남구': { nx: 102, ny: 84 },
  '울산광역시 동구': { nx: 104, ny: 83 },
  '울산광역시 북구': { nx: 103, ny: 85 },
  '울산광역시 울주군': { nx: 101, ny: 84 },
  // 세종특별자치시
  '세종특별자치시 세종시': { nx: 66, ny: 103 },
  // 경기도
  '경기도 수원시 장안구': { nx: 60, ny: 121 },
  '경기도 수원시 권선구': { nx: 60, ny: 121 },
  '경기도 수원시 팔달구': { nx: 61, ny: 121 },
  '경기도 수원시 영통구': { nx: 61, ny: 120 },
  '경기도 성남시 수정구': { nx: 63, ny: 124 },
  '경기도 성남시 중원구': { nx: 63, ny: 124 },
  '경기도 성남시 분당구': { nx: 62, ny: 123 },
  '경기도 의정부시': { nx: 61, ny: 130 },
  '경기도 안양시 만안구': { nx: 59, ny: 123 },
  '경기도 안양시 동안구': { nx: 60, ny: 123 },
  '경기도 부천시': { nx: 56, ny: 125 },
  '경기도 광명시': { nx: 58, ny: 125 },
  '경기도 평택시': { nx: 62, ny: 114 },
  '경기도 동두천시': { nx: 61, ny: 134 },
  '경기도 안산시 상록구': { nx: 58, ny: 121 },
  '경기도 안산시 단원구': { nx: 57, ny: 121 },
  '경기도 고양시 덕양구': { nx: 57, ny: 128 },
  '경기도 고양시 일산동구': { nx: 56, ny: 129 },
  '경기도 고양시 일산서구': { nx: 55, ny: 130 },
  '경기도 과천시': { nx: 60, ny: 124 },
  '경기도 구리시': { nx: 62, ny: 127 },
  '경기도 남양주시': { nx: 64, ny: 128 },
  '경기도 오산시': { nx: 62, ny: 117 },
  '경기도 시흥시': { nx: 57, ny: 123 },
  '경기도 군포시': { nx: 59, ny: 122 },
  '경기도 의왕시': { nx: 60, ny: 122 },
  '경기도 하남시': { nx: 64, ny: 126 },
  '경기도 용인시 처인구': { nx: 64, ny: 119 },
  '경기도 용인시 기흥구': { nx: 62, ny: 120 },
  '경기도 용인시 수지구': { nx: 62, ny: 122 },
  '경기도 파주시': { nx: 56, ny: 131 },
  '경기도 이천시': { nx: 68, ny: 121 },
  '경기도 안성시': { nx: 65, ny: 115 },
  '경기도 김포시': { nx: 55, ny: 128 },
  '경기도 화성시': { nx: 57, ny: 119 },
  '경기도 광주시': { nx: 65, ny: 123 },
  '경기도 양주시': { nx: 61, ny: 131 },
  '경기도 포천시': { nx: 64, ny: 134 },
  '경기도 여주시': { nx: 71, ny: 121 },
  '경기도 연천군': { nx: 61, ny: 138 },
  '경기도 가평군': { nx: 69, ny: 133 },
  '경기도 양평군': { nx: 69, ny: 125 },
  // 강원특별자치도
  '강원특별자치도 춘천시': { nx: 73, ny: 134 },
  '강원특별자치도 원주시': { nx: 76, ny: 122 },
  '강원특별자치도 강릉시': { nx: 92, ny: 131 },
  '강원특별자치도 동해시': { nx: 97, ny: 127 },
  '강원특별자치도 태백시': { nx: 95, ny: 119 },
  '강원특별자치도 속초시': { nx: 87, ny: 141 },
  '강원특별자치도 삼척시': { nx: 98, ny: 125 },
  '강원특별자치도 홍천군': { nx: 75, ny: 130 },
  '강원특별자치도 횡성군': { nx: 77, ny: 125 },
  '강원특별자치도 영월군': { nx: 86, ny: 119 },
  '강원특별자치도 평창군': { nx: 84, ny: 123 },
  '강원특별자치도 정선군': { nx: 89, ny: 123 },
  '강원특별자치도 철원군': { nx: 65, ny: 139 },
  '강원특별자치도 화천군': { nx: 72, ny: 139 },
  '강원특별자치도 양구군': { nx: 77, ny: 141 },
  '강원특별자치도 인제군': { nx: 80, ny: 138 },
  '강원특별자치도 고성군': { nx: 85, ny: 145 },
  '강원특별자치도 양양군': { nx: 88, ny: 138 },
  // 충청북도
  '충청북도 청주시 상당구': { nx: 69, ny: 107 },
  '충청북도 청주시 서원구': { nx: 69, ny: 107 },
  '충청북도 청주시 흥덕구': { nx: 67, ny: 107 },
  '충청북도 청주시 청원구': { nx: 69, ny: 108 },
  '충청북도 충주시': { nx: 76, ny: 114 },
  '충청북도 제천시': { nx: 81, ny: 118 },
  '충청북도 보은군': { nx: 73, ny: 103 },
  '충청북도 옥천군': { nx: 71, ny: 99 },
  '충청북도 영동군': { nx: 74, ny: 97 },
  '충청북도 증평군': { nx: 71, ny: 110 },
  '충청북도 진천군': { nx: 68, ny: 111 },
  '충청북도 괴산군': { nx: 74, ny: 111 },
  '충청북도 음성군': { nx: 72, ny: 113 },
  '충청북도 단양군': { nx: 84, ny: 115 },
  // 충청남도
  '충청남도 천안시 동남구': { nx: 63, ny: 110 },
  '충청남도 천안시 서북구': { nx: 62, ny: 111 },
  '충청남도 공주시': { nx: 63, ny: 102 },
  '충청남도 보령시': { nx: 54, ny: 100 },
  '충청남도 아산시': { nx: 60, ny: 111 },
  '충청남도 서산시': { nx: 51, ny: 110 },
  '충청남도 논산시': { nx: 62, ny: 96 },
  '충청남도 계룡시': { nx: 65, ny: 99 },
  '충청남도 당진시': { nx: 54, ny: 112 },
  '충청남도 금산군': { nx: 69, ny: 97 },
  '충청남도 부여군': { nx: 59, ny: 99 },
  '충청남도 서천군': { nx: 55, ny: 94 },
  '충청남도 청양군': { nx: 59, ny: 104 },
  '충청남도 홍성군': { nx: 55, ny: 107 },
  '충청남도 예산군': { nx: 58, ny: 108 },
  '충청남도 태안군': { nx: 48, ny: 109 },
  // 전북특별자치도
  '전북특별자치도 전주시 완산구': { nx: 63, ny: 89 },
  '전북특별자치도 전주시 덕진구': { nx: 63, ny: 89 },
  '전북특별자치도 군산시': { nx: 56, ny: 92 },
  '전북특별자치도 익산시': { nx: 60, ny: 91 },
  '전북특별자치도 정읍시': { nx: 58, ny: 83 },
  '전북특별자치도 남원시': { nx: 68, ny: 80 },
  '전북특별자치도 김제시': { nx: 59, ny: 87 },
  '전북특별자치도 완주군': { nx: 65, ny: 88 },
  '전북특별자치도 진안군': { nx: 72, ny: 88 },
  '전북특별자치도 무주군': { nx: 75, ny: 93 },
  '전북특별자치도 장수군': { nx: 70, ny: 85 },
  '전북특별자치도 임실군': { nx: 66, ny: 84 },
  '전북특별자치도 순창군': { nx: 63, ny: 79 },
  '전북특별자치도 고창군': { nx: 56, ny: 80 },
  '전북특별자치도 부안군': { nx: 54, ny: 87 },
  // 전라남도
  '전라남도 목포시': { nx: 51, ny: 67 },
  '전라남도 여수시': { nx: 73, ny: 66 },
  '전라남도 순천시': { nx: 70, ny: 70 },
  '전라남도 나주시': { nx: 56, ny: 71 },
  '전라남도 광양시': { nx: 73, ny: 68 },
  '전라남도 담양군': { nx: 61, ny: 78 },
  '전라남도 곡성군': { nx: 66, ny: 77 },
  '전라남도 구례군': { nx: 69, ny: 75 },
  '전라남도 고흥군': { nx: 66, ny: 62 },
  '전라남도 보성군': { nx: 62, ny: 66 },
  '전라남도 화순군': { nx: 61, ny: 72 },
  '전라남도 장흥군': { nx: 59, ny: 64 },
  '전라남도 강진군': { nx: 57, ny: 63 },
  '전라남도 해남군': { nx: 54, ny: 61 },
  '전라남도 영암군': { nx: 56, ny: 66 },
  '전라남도 무안군': { nx: 52, ny: 71 },
  '전라남도 함평군': { nx: 54, ny: 73 },
  '전라남도 영광군': { nx: 52, ny: 77 },
  '전라남도 장성군': { nx: 57, ny: 77 },
  '전라남도 완도군': { nx: 55, ny: 56 },
  '전라남도 진도군': { nx: 48, ny: 59 },
  '전라남도 신안군': { nx: 47, ny: 69 },
  // 경상북도
  '경상북도 포항시 남구': { nx: 102, ny: 94 },
  '경상북도 포항시 북구': { nx: 102, ny: 95 },
  '경상북도 경주시': { nx: 100, ny: 91 },
  '경상북도 김천시': { nx: 80, ny: 97 },
  '경상북도 안동시': { nx: 91, ny: 106 },
  '경상북도 구미시': { nx: 84, ny: 96 },
  '경상북도 영주시': { nx: 89, ny: 111 },
  '경상북도 영천시': { nx: 95, ny: 93 },
  '경상북도 상주시': { nx: 81, ny: 102 },
  '경상북도 문경시': { nx: 81, ny: 106 },
  '경상북도 경산시': { nx: 91, ny: 90 },
  '경상북도 군위군': { nx: 88, ny: 99 },
  '경상북도 의성군': { nx: 90, ny: 103 },
  '경상북도 청송군': { nx: 96, ny: 103 },
  '경상북도 영양군': { nx: 97, ny: 108 },
  '경상북도 영덕군': { nx: 102, ny: 103 },
  '경상북도 청도군': { nx: 91, ny: 86 },
  '경상북도 고령군': { nx: 87, ny: 85 },
  '경상북도 성주군': { nx: 83, ny: 91 },
  '경상북도 칠곡군': { nx: 85, ny: 93 },
  '경상북도 예천군': { nx: 86, ny: 107 },
  '경상북도 봉화군': { nx: 94, ny: 113 },
  '경상북도 울진군': { nx: 102, ny: 115 },
  '경상북도 울릉군': { nx: 127, ny: 127 },
  // 경상남도
  '경상남도 창원시 의창구': { nx: 89, ny: 77 },
  '경상남도 창원시 성산구': { nx: 90, ny: 76 },
  '경상남도 창원시 마산합포구': { nx: 88, ny: 76 },
  '경상남도 창원시 마산회원구': { nx: 89, ny: 76 },
  '경상남도 창원시 진해구': { nx: 91, ny: 75 },
  '경상남도 진주시': { nx: 81, ny: 75 },
  '경상남도 통영시': { nx: 87, ny: 68 },
  '경상남도 사천시': { nx: 80, ny: 71 },
  '경상남도 김해시': { nx: 95, ny: 77 },
  '경상남도 밀양시': { nx: 96, ny: 83 },
  '경상남도 거제시': { nx: 90, ny: 68 },
  '경상남도 양산시': { nx: 97, ny: 79 },
  '경상남도 의령군': { nx: 87, ny: 78 },
  '경상남도 함안군': { nx: 86, ny: 77 },
  '경상남도 창녕군': { nx: 91, ny: 83 },
  '경상남도 고성군': { nx: 85, ny: 71 },
  '경상남도 남해군': { nx: 77, ny: 68 },
  '경상남도 하동군': { nx: 74, ny: 73 },
  '경상남도 산청군': { nx: 76, ny: 79 },
  '경상남도 함양군': { nx: 74, ny: 82 },
  '경상남도 거창군': { nx: 77, ny: 86 },
  '경상남도 합천군': { nx: 82, ny: 82 },
  // 제주특별자치도
  '제주특별자치도 제주시': { nx: 53, ny: 38 },
  '제주특별자치도 서귀포시': { nx: 52, ny: 33 },
};

// ── Feels-Like Temperature ──
function calcFeelsLikeCold(t: number, v: number): number {
  if (v < 1.3) return t;
  const v016 = Math.pow(v * 3.6, 0.16);
  return 13.12 + 0.6215 * t - 11.37 * v016 + 0.3965 * t * v016;
}

function calcFeelsLikeHot(t: number, rh: number): number {
  const t2 = t * t, rh2 = rh * rh;
  return (
    -8.7847 + 1.6114 * t + 2.3385 * rh - 0.1461 * t * rh -
    0.0123 * t2 - 0.0164 * rh2 + 0.0022 * t2 * rh +
    0.0007 * t * rh2 - 0.0000036 * t2 * rh2
  );
}

function calcFeelsLike(tmp: number, wsd: number, reh: number): number {
  if (tmp <= 10) return Math.round(calcFeelsLikeCold(tmp, wsd) * 10) / 10;
  if (tmp >= 33) return Math.round(calcFeelsLikeHot(tmp, reh) * 10) / 10;
  return Math.round(tmp * 10) / 10;
}

// ── Delta Calculation ──
function calcDelta(yesterday: WeatherData, today: WeatherData): Delta {
  const feelsLikeDelta = today.feelsLike - yesterday.feelsLike;
  const windDelta = today.windSpeed - yesterday.windSpeed;
  return {
    feelsLikeDelta,
    tempMinDelta: today.tempMin - yesterday.tempMin,
    tempMaxDelta: today.tempMax - yesterday.tempMax,
    windDelta,
    newRain: yesterday.rainProb < 60 && today.rainProb >= 60 && !today.isSnow,
    newSnow: !yesterday.isSnow && today.isSnow && today.rainProb >= 60,
    newWind: windDelta >= 3,
  };
}

// ── Emoji & Text ──
const TEMP_EMOJI: Record<string, string> = {
  MUCH_COLDER: '🥶', COLDER: '😬', SIMILAR: '😊', WARMER: '😄', MUCH_WARMER: '🥵',
};
const WIND_EMOJI = '💨';
const RAIN_EMOJI = '🌧️';
const SNOW_EMOJI = '🌨️';

function getTempKey(delta: number): string {
  if (delta <= -5) return 'MUCH_COLDER';
  if (delta <= -2) return 'COLDER';
  if (delta <= 2) return 'SIMILAR';
  if (delta <= 5) return 'WARMER';
  return 'MUCH_WARMER';
}

const TEMP_TEXT_CONNECTIVE: Record<string, string> = {
  MUCH_COLDER: '춥고', COLDER: '쌀쌀하고', SIMILAR: '비슷한데', WARMER: '따뜻하고', MUCH_WARMER: '따뜻하고',
};
const TEMP_TEXT: Record<string, string> = {
  MUCH_COLDER: '많이 추워', COLDER: '쌀쌀해', SIMILAR: '비슷해', WARMER: '따뜻해', MUCH_WARMER: '많이 따뜻해',
};

function buildEmoji(delta: Delta): string {
  const tempEmoji = TEMP_EMOJI[getTempKey(delta.feelsLikeDelta)];
  if (delta.newSnow) return tempEmoji + SNOW_EMOJI;
  if (delta.newRain) return tempEmoji + RAIN_EMOJI;
  if (delta.newWind) return tempEmoji + WIND_EMOJI;
  return tempEmoji;
}

function buildDesc(delta: Delta): string {
  const key = getTempKey(delta.feelsLikeDelta);
  if (delta.newSnow) return `${TEMP_TEXT_CONNECTIVE[key]} 눈 와요`;
  if (delta.newRain) return `${TEMP_TEXT_CONNECTIVE[key]} 비 와요`;
  if (delta.newWind) return `${TEMP_TEXT_CONNECTIVE[key]} 바람 강해요`;
  return `${TEMP_TEXT[key]}요`;
}

function buildTempSuffix(delta: Delta): string {
  const diff = Math.abs(Math.round(delta.feelsLikeDelta));
  if (diff === 0) return '비슷해요';
  return `${diff}도 ${delta.feelsLikeDelta < 0 ? '추워요' : '따뜻해요'}`;
}

// ── KMA API ──
const KMA_BASE = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0';

async function fetchForecast(
  nx: number, ny: number, baseDate: string, baseTime: string
): Promise<KmaItem[]> {
  const key = process.env.KMA_API_KEY;
  if (!key) throw new Error('KMA_API_KEY not set');

  const params = [
    `serviceKey=${key}`,
    'numOfRows=1000', 'pageNo=1', 'dataType=JSON',
    `base_date=${baseDate}`, `base_time=${baseTime}`,
    `nx=${nx}`, `ny=${ny}`,
  ];

  const url = `${KMA_BASE}/getVilageFcst?${params.join('&')}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`KMA HTTP ${res.status}`);

  const data = await res.json();
  if (data.response?.header?.resultCode !== '00') {
    throw new Error(`KMA Error: ${data.response?.header?.resultMsg || 'unknown'}`);
  }

  return data.response.body.items.item || [];
}

// ── Transform KMA → SessionWeather ──
interface HourlyData {
  hour: number; tmp: number; reh: number; wsd: number; pop: number; pty: number;
}

function transformForecast(items: KmaItem[], targetDate: string): SessionWeather {
  const grouped = new Map<string, Map<string, string>>();
  for (const item of items) {
    const key = `${item.fcstDate}_${item.fcstTime}`;
    if (!grouped.has(key)) grouped.set(key, new Map());
    grouped.get(key)!.set(item.category, item.fcstValue);
  }

  const allHourly: HourlyData[] = [];
  for (const [key, cats] of grouped) {
    const [date, time] = key.split('_');
    if (date !== targetDate) continue;
    allHourly.push({
      hour: parseInt(time.slice(0, 2), 10),
      tmp: parseFloat(cats.get('TMP') || '0'),
      reh: parseFloat(cats.get('REH') || '50'),
      wsd: parseFloat(cats.get('WSD') || '0'),
      pop: parseFloat(cats.get('POP') || '0'),
      pty: parseInt(cats.get('PTY') || '0', 10),
    });
  }

  let tmn: number | null = null, tmx: number | null = null;
  for (const item of items) {
    if (item.fcstDate !== targetDate) continue;
    if (item.category === 'TMN') tmn = parseFloat(item.fcstValue);
    if (item.category === 'TMX') tmx = parseFloat(item.fcstValue);
  }

  const aggregate = (list: HourlyData[], tmnO: number | null, tmxO: number | null): WeatherData => {
    if (list.length === 0) return { feelsLike: 0, tempMin: 0, tempMax: 0, rainProb: 0, windSpeed: 0, isSnow: false, humidity: 50, temperature: 0 };
    const temps = list.map(h => h.tmp);
    const avgT = list.reduce((s, h) => s + h.tmp, 0) / list.length;
    const avgR = list.reduce((s, h) => s + h.reh, 0) / list.length;
    const avgW = list.reduce((s, h) => s + h.wsd, 0) / list.length;
    return {
      feelsLike: calcFeelsLike(avgT, avgW, avgR),
      tempMin: tmnO ?? Math.min(...temps),
      tempMax: tmxO ?? Math.max(...temps),
      rainProb: Math.max(...list.map(h => h.pop)),
      windSpeed: Math.round(avgW * 10) / 10,
      isSnow: list.some(h => h.pty === 2 || h.pty === 3),
      humidity: Math.round(avgR),
      temperature: Math.round(avgT * 10) / 10,
    };
  };

  const morning = allHourly.filter(h => h.hour >= 6 && h.hour < 12);
  const afternoon = allHourly.filter(h => h.hour >= 12 && h.hour < 18);

  return {
    morning: aggregate(morning, null, null),
    afternoon: aggregate(afternoon, null, null),
    daily: aggregate(allHourly, tmn, tmx),
  };
}

// ── Date Helpers ──
function formatDate(d: Date): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}

function getLatestBase(now: Date): { baseDate: string; baseTime: string } {
  const cur = now.getHours() * 60 + now.getMinutes();
  const bases = [
    { time: '2300', min: 23 * 60 + 10 }, { time: '2000', min: 20 * 60 + 10 },
    { time: '1700', min: 17 * 60 + 10 }, { time: '1400', min: 14 * 60 + 10 },
    { time: '1100', min: 11 * 60 + 10 }, { time: '0800', min: 8 * 60 + 10 },
    { time: '0500', min: 5 * 60 + 10 }, { time: '0200', min: 2 * 60 + 10 },
  ];
  for (const b of bases) {
    if (cur >= b.min) return { baseDate: formatDate(now), baseTime: b.time };
  }
  return { baseDate: formatDate(addDays(now, -1)), baseTime: '2300' };
}

// ── Handler ──
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const region = (req.query.region as string) || '서울';
  const coords = LOCATION_CODES[region];

  if (!coords) {
    return res.status(400).json({ error: `지원하지 않는 지역: ${region}` });
  }

  try {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const todayStr = formatDate(now);
    const yesterdayStr = formatDate(addDays(now, -1));

    const todayBase = getLatestBase(now);
    const yesterdayBase = { baseDate: formatDate(addDays(now, -1)), baseTime: '0200' };

    const [todayItems, yesterdayItems] = await Promise.all([
      fetchForecast(coords.nx, coords.ny, todayBase.baseDate, todayBase.baseTime),
      fetchForecast(coords.nx, coords.ny, yesterdayBase.baseDate, yesterdayBase.baseTime),
    ]);

    const today = transformForecast(todayItems, todayStr);
    const yesterday = transformForecast(yesterdayItems, yesterdayStr);

    const delta = {
      morning: calcDelta(yesterday.morning, today.morning),
      afternoon: calcDelta(yesterday.afternoon, today.afternoon),
      daily: calcDelta(yesterday.daily, today.daily),
    };

    const result = {
      today,
      yesterday,
      delta,
      emoji: buildEmoji(delta.daily),
      description: buildDesc(delta.daily),
      tempSuffix: buildTempSuffix(delta.daily),
    };

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('Weather API error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

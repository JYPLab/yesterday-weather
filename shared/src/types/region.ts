export interface RegionCode {
  nx: number;
  ny: number;
}

export interface Region {
  sido: string;   // 시/도 (예: "서울특별시", "경기도")
  name: string;   // 시군구 (예: "종로구", "수원시 장안구")
  code: RegionCode;
}

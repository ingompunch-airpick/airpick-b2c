export interface EsimCountry {
  code: string;
  name: string;
}

/** 유심/eSIM 비교 — 국가·지역 목록 */
export const ESIM_COUNTRIES: EsimCountry[] = [
  { code: 'JP', name: '일본' },
  { code: 'US', name: '미국' },
  { code: 'TH', name: '태국' },
  { code: 'VN', name: '베트남' },
  { code: 'PH', name: '필리핀' },
  { code: 'CN', name: '중국' },
  { code: 'TW', name: '대만' },
  { code: 'EU', name: '유럽' },
  { code: 'AU', name: '호주' },
];

export function getEsimCountryName(code: string): string {
  return ESIM_COUNTRIES.find((c) => c.code === code)?.name ?? code;
}

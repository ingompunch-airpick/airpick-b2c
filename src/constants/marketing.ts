/** 에어픽 B2C 마케팅 — 위치 · 사진 · 보험 통일 카피 */

export const BRAND_TAGLINE = '맡긴 차, 어디 있는지까지';

export const BRAND_SUBLINE = '입고 사진 · 주차 위치 · 보험 — MY에서 확인하세요';

/** 홈 — 비교 플랫폼 인트로 */
export const HOME_PLATFORM_LINE = '비교하고 떠나세요';

export const HOME_PLATFORM_SUB = '인천공항 · 주차 · 유심';

export const HOME_PARKING = {
  headline: '주차대행 · 업체 요금, 한 번에',
  highlights: ['업체별 주차장 위치', '보험 유무', '앱 바로 예약'],
  cta: '가격 비교',
} as const;

export const HOME_ESIM = {
  label: '유심·eSIM',
  hook: '제휴 요금, 가격순',
  highlights: ['나라·일수 선택', 'LTE·5G', '제휴사 구매'],
  cta: '요금 비교',
} as const;

export const TRUST_BADGES = [
  { id: 'location', label: '위치 공유' },
  { id: 'photos', label: '사진 공유' },
  { id: 'insurance', label: '보험' },
] as const;

export const RESERVATION_STEPS = ['접수', '입고', '주차중', '출고'] as const;

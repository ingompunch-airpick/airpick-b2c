/** 에어픽 B2C 마케팅 — 위치 · 사진 · 보험 통일 카피 */

/** 하단 네비 · 가이드 등에서 쓰는 탭 이름 (주차장과 구분) */
export const PARKING_TAB_LABEL = '주차대행';

/** 유심·eSIM — 탭·Hero·통계 등 사용자-facing 통일 라벨 */
export const ESIM_TAB_LABEL = '유심·eSIM';
export const ESIM_STATS_LABEL = `${ESIM_TAB_LABEL} 제휴사`;
export const ESIM_GUIDE_TITLE = `${ESIM_TAB_LABEL} 이용 가이드`;

/** 주차대행 탭 · 예약 탭 공통 헤드라인 (입고 후 추적 강조) */
export const BRAND_TAGLINE = '맡긴 차, 사진·위치까지';

/** 예약 탭 · 입점 예약 안내 */
export const BRAND_SUBLINE =
  '에어픽 입점 예약 · 입고 사진 · 주차 위치 · 보험 — 예약 탭에서 확인';

/** 주차대행 탭 상단 — 공항만 표기 (탭명에 주차대행 이미 있음) */
export const PARKING_PLATFORM_SUB = '인천공항';

/** 주차 비교 허브 H1 (SEO·화면 공통) */
export const PARKING_COMPARE_H1 = '인천공항 주차대행 가격비교';

/** 주차 비교 탭 상단 — 입점·미입점 모두 포함 */
export const PARKING_COMPARE_DESC =
  '전 업체 요금 비교 · 입점은 보험·거리 확인 후 예약 · 맡긴 뒤 위치·사진';

export const PARKING_COMPARE_DOCUMENT_TITLE = '인천공항 주차대행 가격비교 · 에어픽';

/** 유심·eSIM 비교 허브 H1 (SEO·화면 공통) */
export const ESIM_COMPARE_H1 = '해외여행 유심·eSIM 가격비교';

export const ESIM_COMPARE_DESC =
  '나라·용량·일수·eSIM/USIM으로 제휴 참고가 비교 · 구매·개통은 제휴사에서';

export const ESIM_COMPARE_DOCUMENT_TITLE = '해외여행 유심·eSIM 가격비교 · 에어픽';

export const ESIM_COMPARE_SUB = '제휴 요금 비교';

export const PARKING_PARTNER_SECTION = {
  title: '에어픽 입점 · 바로 예약',
  titleDistance: '에어픽 입점 · 거리순',
  subtitleNote: '보험·주차 위치 확인 · 후기 · 예약 추적',
} as const;

export const PARKING_EXTERNAL_SECTION = {
  title: '가격 비교 · 홈페이지 이동',
  subtitleNote: '참고 요금 · 위치·보험·후기는 에어픽에서 제공하지 않음',
} as const;

/** 업체 홈페이지 예약 — 에어픽 전용 추적 안내 */
export const AIRPICK_TRACKING_UPSELL = {
  title: '입고 위치·사진은 에어픽 예약 전용',
  body: '에어픽에서 직접 예약하시면 입고 후 주차 위치·사진·보험을 이곳에서 확인할 수 있어요.',
  cta: '에어픽에서 예약하기',
} as const;

/** 홈 — Hero 카피 (한 줄 · 바로 행동) */
export const HOME_EYEBROW = `인천공항 주차대행 · ${ESIM_TAB_LABEL} 가격비교`;

export const HOME_HEADLINE = '입점 업체 요금·보험 비교, 맡긴 뒤 위치·사진까지';

export const HOME_PARKING = {
  headline: '주차대행 · 업체 요금 비교',
  highlights: ['T1·T2·야간 할증', '실내·야외 견적', '입점 업체 바로 예약'],
  cta: '주차대행 비교하기',
} as const;

/** @deprecated HOME_EYEBROW 사용 */
export const HOME_PLATFORM_LINE = HOME_HEADLINE;

/** @deprecated HOME_EYEBROW 사용 */
export const HOME_PLATFORM_SUB = HOME_EYEBROW;

export const HOME_ESIM = {
  headline: `${ESIM_TAB_LABEL} · 제휴 요금 비교`,
  highlights: ['제휴사별 참고 요금', '나라·용량·일수', '낮은 가격순 정렬'],
  cta: `${ESIM_TAB_LABEL} 요금 비교하기`,
} as const;

export const PARTNER_PROMISE = '에어픽 제휴 업체는 맡긴 뒤에도 보입니다';

export const TRUST_PILLARS = [
  {
    id: 'location',
    title: '주차 위치',
    desc: '입고 후 주차장 위치를 예약 탭에서 바로 확인',
  },
  {
    id: 'photos',
    title: '입고 사진',
    desc: '입고 시 기사가 촬영한 차량 사진을 예약 탭에서 확인',
  },
  {
    id: 'insurance',
    title: '보험',
    desc: '가입 여부·보장 한도를 미리 확인',
  },
] as const;

export const TRUST_BADGES = [
  { id: 'location', label: '위치 공유' },
  { id: 'photos', label: '사진 공유' },
  { id: 'insurance', label: '보험' },
] as const;

export const RESERVATION_STEPS = ['접수', '입고', '주차중', '출고'] as const;

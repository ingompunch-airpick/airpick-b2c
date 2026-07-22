/** 에어픽 B2C 마케팅 — 위치 · 사진 · 보험 통일 카피 */

/** 하단 네비 · 가이드 등에서 쓰는 탭 이름 (주차장과 구분) */
export const PARKING_TAB_LABEL = '주차대행 비교';

/** 공항주변스팟 탭 — 지도 허브 (장소형) */
export const SPOTS_TAB_LABEL = '공항주변스팟';

/** 이심 — 탭·Hero·통계 등 사용자-facing (검색 메인 키워드: 이심) */
export const ESIM_TAB_LABEL = '이심 비교';
export const ESIM_STATS_LABEL = '이심 제휴사';
export const ESIM_GUIDE_TITLE = '이심(eSIM) 이용 가이드';

/** 아직 공개하지 않는 앱 탭 */
export const APP_TAB_SOON = {
  esim: true,
  spots: true,
} as const;

/** 예약 탭 */
export const MY_TAB_LABEL = '내 예약';

/** 홈 탭 — 출국시간 계산기 (혼잡·대기 여유 계획 수요) */
export const HOME_TAB_LABEL = '출국시간';

/** 주차대행 탭 · 예약 탭 공통 헤드라인 (입고 후 추적 강조) */
export const BRAND_TAGLINE = '맡긴 차, 사진·위치까지';

/** 예약 탭 · 입점 예약 안내 */
export const BRAND_SUBLINE =
  '에어픽 입점 예약 · 입고 사진 · 주차 위치 · 보험 — 예약 탭에서 확인';

/** 주차대행 탭 상단 — 공항만 표기 (탭명에 주차대행 이미 있음) */
export const PARKING_PLATFORM_SUB = '인천공항';

/** 주차 비교 허브 H1 (SEO·화면 공통) */
export const PARKING_COMPARE_H1 = '인천공항 주차대행 비교';

/** 주차 비교 탭 상단 — 입점·미입점 모두 포함 */
export const PARKING_COMPARE_DESC =
  '전 업체 요금 비교 · 입점은 보험·거리 확인 후 예약 · 맡긴 뒤 위치·사진';

export const PARKING_COMPARE_DOCUMENT_TITLE = '인천공항 주차대행 비교 · 에어픽';

/** 이심 비교 허브 H1 (SEO·화면 공통) — 메인 키워드 이심, eSIM 병기 */
export const ESIM_COMPARE_H1 = '이심(eSIM) 가격 비교';

export const ESIM_COMPARE_DESC =
  '나라·용량·일수로 제휴 이심 참고가를 비교합니다. 구매·개통은 제휴사에서 진행합니다.';

export const ESIM_COMPARE_DOCUMENT_TITLE = '이심(eSIM) 가격 비교 | 에어픽';

export const ESIM_COMPARE_SUB = '국가별 최저가 참고 비교';

export const PARKING_PARTNER_SECTION = {
  title: '에어픽 입점 · 바로 예약',
  titleDistance: '에어픽 입점 · 거리순',
  subtitleNote: '보험·주차 위치 확인 · 후기 · 예약 추적',
} as const;

export const PARKING_EXTERNAL_SECTION = {
  title: '가격 비교 · 홈페이지 이동',
  subtitleNote: '참고 요금 · 위치·보험·후기는 에어픽에서 제공하지 않음',
} as const;

/** 주차 비교 탭 하단 · 빈 결과 안내 등 내부 링크 */
export const PARKING_COMPARE_GUIDE_LINKS = [
  { href: '/guides/parking-compare/', label: '주차대행 비교·예약 가이드' },
  { href: '/guides/parking-insurance/', label: '보험 확인법' },
  { href: '/guides/partner-vs-external/', label: '입점 vs 미입점' },
  { href: '/guides/official-vs-private/', label: '공식 주차장 vs 사설' },
  { href: '/guides/t1-t2-unseo/', label: 'T1·T2·운서역 고르기' },
  { href: '/faq/', label: '자주 묻는 질문' },
] as const;

/** 업체 홈페이지 예약 — 에어픽 전용 추적 안내 */
export const AIRPICK_TRACKING_UPSELL = {
  title: '입고 위치·사진은 에어픽 예약 전용',
  body: '에어픽에서 직접 예약하시면 입고 후 주차 위치·사진·보험을 이곳에서 확인할 수 있어요.',
  cta: '에어픽에서 예약하기',
} as const;

/**
 * 홈 — 출국시간 계산기 (SEO Hook)
 * 흐름: 계산기 → 주차대행 비교 → 예약 (이심·스팟은 Soon)
 * H1·메타·SEO 본문은 유지. UX는 출국 준비 허브로 연결.
 */
export const HOME_EYEBROW = '에어픽 · 출국시간 계산';

export const HOME_HEADLINE = '인천공항 출국시간 계산기';

/** 히어로 서브 — 한 줄 (H1 유지) */
export const HOME_SUBHEAD = '출국 준비의 첫 단계, 추천 출발 시간을 확인하세요.';

export const HOME_CALCULATE_CTA = '출국시간 계산하기';

export const HOME_CALCULATING = '계산 중…';

export const HOME_RESULT_EYEBROW = '추천 출발 시각';

export const HOME_LEAVE_DISCLAIMER =
  '비행기 출발 3시간 전 공항 도착을 기준으로 계산합니다. 체크인·보안검색·출국심사 시간은 해당 3시간에 포함되어 있습니다. 공항 혼잡도 및 항공사 상황에 따라 실제 소요시간은 달라질 수 있습니다.';

export const HOME_PEAK_ADVISORY =
  '현재 출국객이 많은 기간입니다. 평소보다 15~20분 정도 더 여유 있게 출발하는 것을 권장합니다.';

/** 계산 완료 후 · 다음 준비 섹션 */
export const HOME_NEXT_PREP = {
  done: '출국시간 계산 완료',
  title: '다음 준비',
  bridge: '출국 준비는 여기서 끝이 아닙니다.',
  bridgeSub: '다음 준비도 함께 확인해보세요.',
  parking: {
    title: '주차대행 비교',
    body: '장기주차와 비교해보세요.',
    benefit: '출국 전 불필요한 이동을 줄여보세요.',
    cta: '주차대행 비교하기',
    href: '/parking',
  },
  esim: {
    title: '이심 비교',
    body: '출국 전 데이터도 준비하세요.',
    cta: '이심 비교하기',
    href: '/esim',
  },
  reserve: {
    title: '예약',
    body: '입점 업체는 비교 후 바로 예약할 수 있어요.',
    cta: '내 예약 보기',
    href: '/my',
  },
} as const;

/** @deprecated HOME_NEXT_PREP.parking 사용 */
export const HOME_VALET_NOTE = {
  body: HOME_NEXT_PREP.parking.benefit,
  cta: HOME_NEXT_PREP.parking.cta,
} as const;

/** 주차대행 선택 시 · 고정 시간 미포함 안내 */
export const HOME_VALET_MODE_NOTE =
  '주차대행은 업체마다 차량 인수 위치가 달라, 터미널 도착 후 이동 시간은 계산에 넣지 않았습니다. 업체 상세에서 이용 방법을 확인해 주세요.';

/** @deprecated HOME_VALET_NOTE 사용 */
export const HOME_VALET_UPSELL = {
  eyebrow: '참고',
  title: HOME_VALET_NOTE.body,
  selfLabel: '장기주차',
  valetLabel: '주차대행',
  cta: HOME_VALET_NOTE.cta,
  ctaDesc: '입점 업체 요금·예약',
} as const;

export const HOME_PARKING = {
  headline: '주차대행 비교',
  highlights: ['T1·T2·야간 할증', '실내·야외 견적', '입점 업체 바로 예약'],
  cta: '주차대행 비교하기',
} as const;

/** @deprecated HOME_EYEBROW 사용 */
export const HOME_PLATFORM_LINE = HOME_HEADLINE;

/** @deprecated HOME_EYEBROW 사용 */
export const HOME_PLATFORM_SUB = HOME_EYEBROW;

export const HOME_ESIM = {
  headline: '이심 비교 · 제휴 요금',
  highlights: ['제휴사별 참고 요금', '나라·용량·일수', '낮은 가격순 정렬'],
  cta: '이심 요금 비교하기',
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
    desc: '가입 여부·보험 안내를 미리 확인',
  },
] as const;

export const TRUST_BADGES = [
  { id: 'location', label: '위치 공유' },
  { id: 'photos', label: '사진 공유' },
  { id: 'insurance', label: '보험' },
] as const;

export const RESERVATION_STEPS = ['접수', '입고', '주차중', '출고'] as const;

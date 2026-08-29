/** 에어픽 B2C 마케팅 — 위치 · 사진 · 보험 통일 카피 */

/** 하단 네비 · 가이드 등에서 쓰는 탭 이름 (주차장과 구분) */
export const PARKING_TAB_LABEL = '주차대행';

/** 공항주변스팟 탭 — 지도 허브 (장소형) */
export const SPOTS_TAB_LABEL = '공항주변스팟';

/** 이심 — 탭·Hero·통계 등 사용자-facing (검색 메인 키워드: 이심) */
export const ESIM_TAB_LABEL = '이심';
export const ESIM_STATS_LABEL = '이심 제휴사';
export const ESIM_GUIDE_TITLE = '이심(eSIM) 이용 가이드';

/** 아직 공개하지 않는 앱 탭 */
export const APP_TAB_SOON = {
  esim: false,
} as const;

/** 예약 탭 */
export const MY_TAB_LABEL = '내 예약';

/** 홈 탭 — 왜 에어픽(후킹). 일정은 주차·이심 탭 */
export const HOME_TAB_LABEL = '홈';

/** 주차대행 탭 · 예약 탭 공통 헤드라인 (입고 후 추적 강조) */
export const BRAND_TAGLINE = '맡긴 차, 사진·위치까지';

/** 예약 탭 · 입점 예약 안내 */
export const BRAND_SUBLINE =
  '에어픽 입점 예약 · 입고 사진 · 주차 위치 · 보험 — 예약 탭에서 확인';

/** 주차대행 탭 상단 — 공항만 표기 (탭명에 주차대행 이미 있음) */
export const PARKING_PLATFORM_SUB = '인천공항';

/** 주차 비교 허브 H1 (화면) — SEO 키워드는 document title에 유지 */
export const PARKING_COMPARE_H1 = '주차대행, 아무 데나 예약하지 마세요.';

/** 주차 비교 탭 상단 — 입점·미입점 모두 포함 */
export const PARKING_COMPARE_DESC =
  '예약·입고 추적은 AIRPICK VERIFIED만. 가격·보험·평점까지 보고 검증 파트너부터 예약하세요.';

export const PARKING_COMPARE_DOCUMENT_TITLE = '인천공항 주차대행 비교 · 에어픽';

/** 이심 비교 허브 H1 (SEO·화면 공통) — 메인 키워드 이심, eSIM 병기 */
export const ESIM_COMPARE_H1 = '이심(eSIM) 가격 비교';

export const ESIM_COMPARE_DESC =
  '나라·용량·일수로 제휴 이심 참고가를 비교합니다. 구매·개통은 제휴사에서 진행합니다.';

export const ESIM_COMPARE_DOCUMENT_TITLE = '이심(eSIM) 가격 비교 | 에어픽';

export const ESIM_COMPARE_SUB = '국가별 최저가 참고 비교';

/** AIRPICK VERIFIED — 홈 띠·비교 섹션·선정 기준 공통 */
export const AIRPICK_VERIFIED = {
  label: 'AIRPICK VERIFIED',
  eyebrow: '공식 파트너',
  homeLine: '에어픽이 직접 확인한 공식 파트너',
  criteriaCta: '선정 기준 보기',
  criteriaHref: '/guides/partner-vs-external/#verified',
  checklist: [
    '사업자 확인',
    '보험 가입 확인',
    '주차장 확인',
    '차량 관리 기준 확인',
    '에어픽 운영 기준 준수',
  ],
  dontListEveryone: 'WE DON\u2019T LIST EVERYONE.',
  dontListEveryoneKo:
    '에어픽은 사업자·보험·주차장·운영 기준을 확인한 업체만 공식 파트너로 등록합니다.',
} as const;

export const PARKING_PARTNER_SECTION = {
  title: 'AIRPICK VERIFIED',
  titleRating: 'AIRPICK VERIFIED',
  subtitleNote: '에어픽이 직접 확인한 공식 파트너 · 실후기·보험·주차환경',
} as const;

/** 비교 섹션 타이틀 · 검증 파트너 수 */
export const parkingPartnerSectionTitle = (count: number) =>
  `AIRPICK VERIFIED ${count}곳`;

export const PARKING_EXTERNAL_SECTION = {
  title: '에어픽 미입점 · 시장 참고 가격',
  subtitleNote: '참고 요금만 제공 · 보험·주차장 위치는 에어픽이 보증하지 않음',
  /** 카드·섹션용 한 줄 */
  cardNote: '시장 참고 가격 · 보험·주차장 위치는 보증하지 않습니다',
} as const;

/** 주차 비교 탭 하단 · 빈 결과 안내 등 내부 링크 */
export const PARKING_COMPARE_GUIDE_LINKS = [
  { href: '/guides/parking-compare/', label: '주차대행 비교·예약 가이드' },
  { href: '/guides/parking-insurance/', label: '보험 확인법' },
  { href: '/guides/partner-vs-external/', label: 'VERIFIED vs 미입점' },
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
 * 홈 히어로 — 경험 훅 (인트로 무드 연결). 선별 권위는 서브·VERIFIED에서
 */
export const HOME_HEADLINE = '여유로운 출국,\n검증한 주차부터.';

export const HOME_SUBHEAD =
  '에어픽이 확인한 공식 파트너만 모았습니다. 보험·위치·입고 사진까지.';

/** 홈 · 맡겨도 되는 파트너의 기준 (선정 = 왜 에어픽, 한 블록) */
export const HOME_TRUST_CRITERIA = {
  eyebrow: 'AIRPICK VERIFIED',
  title: '맡겨도 되는 파트너의 기준',
  items: [
    {
      id: 'insurance',
      title: '보험 확인',
      body: '사고에 대비할 보험이 확인된 파트너만 등록합니다.',
    },
    {
      id: 'location',
      title: '주차 위치 공개',
      body: '맡긴 차량의 위치를 예약 후 확인할 수 있습니다.',
    },
    {
      id: 'photos',
      title: '입고 사진 공개',
      body: '인계 시점의 차량 상태를 사진으로 남깁니다.',
    },
  ],
  criteriaCta: '선정 기준 자세히',
  criteriaHref: '/guides/partner-vs-external/#verified',
} as const;

/**
 * 홈 하단 · 왜 에어픽인가
 * (기준 3개가 ‘우리가 확인하는 것’이라면, 여기는 ‘우리가 걸러 내는 것’)
 */
export const HOME_WHY_AIRPICK = {
  eyebrow: 'WHY AIRPICK',
  title: '왜 에어픽인가요?',
  lead: '가격만 모아 두지 않습니다. 맡기기 불안한 곳은 먼저 걸러 냅니다.',
  items: [
    {
      id: 'no-insurance',
      title: '무보험 영업을 막습니다',
      body: '보험 없이 영업하는 업체는 공식 파트너가 될 수 없습니다. 사고 뒤 책임 소재가 불분명한 곳은 처음부터 제외합니다.',
    },
    {
      id: 'no-lot',
      title: '주차장 없는 영업을 막습니다',
      body: '계약·확인된 주차장 없이 운영하는 곳은 올리지 않습니다. 차가 어디에 보관되는지 밝힐 수 있어야 합니다.',
    },
    {
      id: 'high-risk',
      title: '불안한 운영 이력을 막습니다',
      body: '사고·불만이 두드러지거나 운영이 불안정한 업체는 선별에서 제외합니다. 평소에도 맡길 수 있는 곳만 남깁니다.',
    },
  ],
} as const;

/** 홈 · 신뢰 수치 — 기준을 다시 설명하지 않고 강도만 */
export const HOME_TRUST_STATS = {
  insuranceValue: '100%',
  insuranceLabel: 'VERIFIED 보험 확인',
  parkingValue: '100%',
  parkingLabel: 'VERIFIED 주차장 확인',
  partnersLabel: '공식 파트너',
  ratingLabel: '실후기 평점',
} as const;

/** 홈 · 후킹 CTA — 일정은 각 탭에서 */
export const HOME_HOOK_CTA = {
  parking: '검증 파트너 예약하기',
  esim: '이심 요금 보기',
} as const;

/** @deprecated 홈 일정 게이트웨이 제거 후 미사용에 가깝음 */
export const HOME_EYEBROW_PREMIUM = 'PREMIUM AIRPORT SERVICES';

/** 브랜드 인트로 게이트 — 영상으로 격 올린 뒤 홈에서 후킹 */
export const BRAND_INTRO = {
  storageKey: 'airpick_intro_seen',
  /** 홈(/) 접속·새로고침마다 표시. 직링크는 스킵. 테스트: /?intro=1 */
  brand: 'AIRPICK',
  eyebrow: 'PREMIUM AIRPORT SERVICES',
  line: '좋은 여행은, 출발 전부터 달라집니다.',
  enterCta: '시작하기',
  /** public/brand — PC 16:9 / 모바일 9:16 */
  videoDesktop: '/brand/intro-desktop.mp4',
  videoMobile: '/brand/intro-mobile.mp4',
  posterDesktop: '/brand/intro-desktop-poster.jpg',
  posterMobile: '/brand/intro-mobile-poster.jpg',
} as const;

/** 홈 · 여행 정보 입력 후 결과로 */
export const HOME_TRIP_CONTINUE_CTA = '내 여행 준비 시작';

/**
 * 홈 · 계산 카드 아래 캠페인 (끝나면 title/body를 빈 문자열로)
 * 얇은 게이트웨이에서는 비노출
 */
export const HOME_CAMPAIGN = {
  title: '',
  body: '',
} as const;

/** @deprecated 결과 CTA로 이동 — 계산 전 노출 안 함 */
export const HOME_TRUST_HINT = '';

export const HOME_CALCULATE_CTA = '출발 시각 계산하기';

export const HOME_CALCULATING = '계산 중…';

export const HOME_RESULT_EYEBROW = '추천 출발 시각';
export const HOME_RESULT_EYEBROW_MODE = (modeLabel: string) =>
  `${HOME_RESULT_EYEBROW} · ${modeLabel} 기준`;

/** 큰 숫자 아래 · 비행기·공항도착·이동 한 줄 */
export const HOME_RESULT_SUMMARY_LINE = (args: {
  flightHm: string;
  arriveHm: string;
  travelMinutes: number;
}) =>
  `비행기 ${args.flightHm} · 공항 ${args.arriveHm} 도착(3시간 전) · 이동 약 ${args.travelMinutes}분`;

export const HOME_LEAVE_DISCLAIMER =
  '비행기 출발 3시간 전 공항 도착을 기준으로 계산합니다. 체크인·보안검색·출국심사 시간은 해당 3시간에 포함되어 있습니다. 공항 혼잡도 및 항공사 상황에 따라 실제 소요시간은 달라질 수 있습니다.';

export const HOME_PEAK_ADVISORY =
  '현재 출국객이 많은 기간입니다. 평소보다 15~20분 정도 더 여유 있게 출발하는 것을 권장합니다.';

/** 결과 상단 · 성수기 요약 (전문은 계산 상세에) */
export const HOME_PEAK_ADVISORY_CHIP = '성수기 · 15~20분 더 여유 권장';

/** 장기주차장 혼잡·매우혼잡일 때만 */
export const HOME_LONG_PARKING_BUSY_HINT = '자리 찾기·셔틀 대기가 길어질 수 있어요.';

/** 결과 본문 · 출국장 대기(참고, 계산 미반영) */
export const HOME_DEPARTURE_HALL_REF_HINT =
  '참고 · 내 체크인·탑승구와 다를 수 있어요. 출발 시각 계산에는 넣지 않았습니다.';

export const HOME_CHECKIN_COUNTER_LABEL = (counter: string) => `체크인 카운터 ${counter}`;

export function formatDepartureHallLiveLine(hall: {
  gate: string;
  side: string | null;
  waitMinutes?: number | null;
  passengers?: number;
}): string {
  const place = `출국장 ${hall.gate}번${hall.side ? ` ${hall.side}` : ''}`;
  const wait =
    hall.waitMinutes != null
      ? `약 ${hall.waitMinutes}분`
      : hall.passengers != null
        ? `약 ${hall.passengers}명`
        : null;
  return wait ? `지금 출국장 대기 · ${place} · ${wait}` : `지금 출국장 대기 · ${place}`;
}

/** 계산 완료 후 · 다음 준비 섹션 */
export const HOME_NEXT_PREP = {
  done: '출발 시각 계산 완료',
  title: '다음 준비',
  bridge: '출국 준비는 여기서 끝이 아닙니다.',
  bridgeSub: '다음 준비도 함께 확인해보세요.',
  parking: {
    title: '주차대행',
    body: '',
    benefit: '에어픽이 검증한 파트너부터 요금을 확인하세요.',
    /** benefit에 시각을 넣을 때 CTA는 비교만 */
    cta: '에어픽 검증 파트너 보기',
    href: '/parking',
  },
  esim: {
    title: '이심',
    body: '출국 전 데이터도 준비하세요.',
    cta: '이심 요금 보기',
    href: '/esim',
  },
  reserve: {
    title: '예약',
    body: '입점 업체는 비교 후 바로 예약할 수 있어요.',
    cta: '내 예약 보기',
    href: '/my',
  },
} as const;

/** 비교 탭 · 계산기에서 넘어온 일정 배지 */
/** 계산 → 주차대행 비교 브릿지 */
export const HOME_TO_COMPARE_BADGE = '출발 시각 계산 일정 기준';
/** @deprecated 비교형 카피(HOME_TO_COMPARE_*)로 대체 */
export const HOME_TO_COMPARE_VALET_LEAVE = (hm: string) =>
  `주차대행이면 ${hm}에 출발해도 여유 있어요`;
export const HOME_TO_COMPARE_LONG_LINE = (hm: string) =>
  `장기주차장이면 ${hm}에 출발해야 돼요`;
export const HOME_TO_COMPARE_VALET_HEAD = '주차대행 이용 시';
export const HOME_TO_COMPARE_VALET_TIME = (hm: string) => `${hm} 출발 가능`;
export const HOME_TO_COMPARE_SAVED = (minutes: number) =>
  `${minutes}분 더 여유롭게 출발`;
export const HOME_TO_COMPARE_LONG_CONGESTION = (level: string) =>
  `지금 장기주차장 · ${level}`;
export const HOME_TO_COMPARE_TIME_HINT = '맡기는·찾는 시간은 아래에서 직접 선택해 주세요.';

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

/** @deprecated HOME_HEADLINE 사용 */
export const HOME_PLATFORM_LINE = HOME_HEADLINE;

/** @deprecated HOME_EYEBROW_PREMIUM 사용 */
export const HOME_EYEBROW = HOME_EYEBROW_PREMIUM;

/** @deprecated */
export const HOME_PLATFORM_SUB = '';

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

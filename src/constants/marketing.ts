/** 에어픽 B2C 마케팅 — 위치 · 사진 · 보험 통일 카피 */

/** 하단 네비 · 가이드 등에서 쓰는 탭 이름 (주차장과 구분) */
export const PARKING_TAB_LABEL = '주차대행';

/** 공항주변스팟 탭 — 지도 허브 (장소형) */
export const SPOTS_TAB_LABEL = '공항주변스팟';

/** 이심 — 탭·Hero·통계 등 사용자-facing (검색 메인 키워드: 이심) */
export const ESIM_TAB_LABEL = '이심';
export const ESIM_STATS_LABEL = '이심 제휴사';
export const ESIM_GUIDE_TITLE = '이심(eSIM), 처음이면 뭐부터?';

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

/** 주차 비교 탭 상단 */
export const PARKING_COMPARE_DESC =
  '에어픽이 확인한 공식 파트너만 비교합니다. 가격·보험·평점 보고 바로 예약하세요.';

export const PARKING_COMPARE_DOCUMENT_TITLE = '인천공항 주차대행 비교 · 에어픽';

/** 이심 허브 H1 (SEO·화면 공통) */
export const ESIM_COMPARE_H1 = '이심';

export const ESIM_COMPARE_DESC =
  '에어픽 × 유심사 프로모션. 제휴 할인 링크로 이동해 구매·개통하세요.';

export const ESIM_COMPARE_DOCUMENT_TITLE = '이심(eSIM) 제휴 할인 | 에어픽';

export const ESIM_COMPARE_SUB = '제휴사 할인 링크로 바로가기';

/** 이심 탭 본문 */
export const ESIM_HUB_LEAD = '출국 전 데이터, 제휴 할인으로 준비하세요';
export const ESIM_HUB_DESC = '에어픽 × 유심사 프로모션';

/** 이심 탭 · 제휴 할인 허브 */
export const ESIM_HUB = {
  title: '이심',
  cobrand: 'AIRPICK × USIMSA',
  cobrandKo: '에어픽 × 유심사',
  promoLabel: '프로모션',
  heroSub: '에어픽 제휴 할인으로 유심사에서 바로 구매하세요',
  whyTitle: '왜 에어픽에서 이심을?',
  whyItems: [
    {
      id: 'discount',
      title: '제휴 할인',
      body: '에어픽 전용 링크로 들어가면 기간 할인이 적용됩니다.',
    },
    {
      id: 'ready',
      title: '출국 전 한곳에서',
      body: '주차대행 예약한 뒤, 같은 앱에서 데이터도 이어서 준비합니다.',
    },
    {
      id: 'partner',
      title: '구매·개통은 제휴사',
      body: '결제·설치·문의는 유심사에서 진행됩니다. 에어픽은 링크만 안내합니다.',
    },
  ],
  stepsTitle: '이용 방법',
  steps: [
    { id: '1', title: '할인 링크 열기', body: '아래 제휴사 버튼을 눌러 유심사로 이동합니다.' },
    { id: '2', title: '요금제 고르기', body: '나라·일수·용량을 유심사에서 선택하고 결제합니다.' },
    { id: '3', title: '개통·설치', body: 'eSIM 설치·문의는 유심사 안내를 따르면 됩니다.' },
  ],
  footerNote:
    '요금·결제·개통·환불은 제휴사 정책을 따릅니다. 표시 할인은 제휴 기간·조건에 따라 달라질 수 있습니다.',
} as const;

/** AIRPICK VERIFIED — 홈 띠·비교 섹션·선정 기준 공통 */
export const AIRPICK_VERIFIED = {
  label: 'AIRPICK VERIFIED',
  eyebrow: '공식 파트너',
  homeLine: '에어픽이 직접 확인한 공식 파트너',
  criteriaCta: '선정 기준 보기',
  criteriaHref: '/partners/',
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
  title: '공식 파트너',
  titleRating: '공식 파트너',
  subtitleNote: '에어픽이 직접 확인한 공식 파트너 · 실후기·보험·주차환경',
} as const;

/** 비교 섹션 타이틀 · 공식 파트너 수 */
export const parkingPartnerSectionTitle = (count: number) => `공식 파트너 ${count}곳`;

/** 주차 비교 탭 하단 · 빈 결과 안내 등 내부 링크 */
export const PARKING_COMPARE_GUIDE_LINKS = [
  { href: '/guides/parking-compare/', label: '주차대행, 어떻게 비교·예약하나요?' },
  { href: '/guides/parking-insurance/', label: '보험, 예약 전에 뭘 확인하나요?' },
  { href: '/guides/official-vs-private/', label: '공식 vs 사설, 뭐가 다른가요?' },
  { href: '/guides/t1-t2-unseo/', label: 'T1·T2·운서역, 어떻게 고르나요?' },
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

export const HOME_SUBHEAD = '에어픽이 확인한 공식 파트너만 모았습니다.';

/** 홈 히어로 · 신뢰 칩 (WHY 02 증거와 동일 문구) */
export const HOME_HERO_TRUST_CHIPS = ['보험 확인', '주차 위치', '입고 사진'] as const;

/** 홈 · 입점·운영 기준 — 검증 후 동일 운영 기준 적용 */
export const HOME_TRUST_CRITERIA = {
  eyebrow: 'AIRPICK VERIFIED',
  title: '에어픽이 직접 확인합니다',
  lead: '입점부터 운영까지, 아래 기준을 통과·준수하는 업체만 공식 파트너로 둡니다.',
  items: [
    {
      id: 'insurance',
      title: '보험 가입 확인',
      body: '입점 전 사고 대비 보험 가입 여부를 확인합니다. 보험이 확인된 업체만 공식 파트너로 등록합니다.',
    },
    {
      id: 'location',
      title: '주차 시설 확인',
      body: '계약·확인된 주차 시설을 운영하는 업체만 선별합니다. 차량이 어디에 보관되는지 밝힐 수 있어야 합니다.',
    },
    {
      id: 'safety',
      title: '안전 운행',
      body: '에어픽 공식 파트너는 과속·신호위반·주정차위반을 하지 않도록 운영 기준을 준수합니다.',
    },
    {
      id: 'photos',
      title: '차량 인계 기록',
      body: '입고 사진과 주차 위치를 예약 후 확인할 수 있습니다. 맡기는 순간부터 기록이 남습니다.',
    },
  ],
  criteriaCta: '입점 업체 보기',
  criteriaHref: '/partners/',
} as const;

/**
 * 홈 · WHY 앞 — 기존 주차대행에 대한 불안(문제) → 아래에서 에어픽 해결
 * 비난·지명 금지. 고객이 겪는 불안만 짧게.
 */
export const HOME_WHY_PROBLEM = {
  title: '주차대행 맡길 때, 불안하지 않으세요?',
  lead: '싸다고 골랐다가, 여행 내내 차 걱정만 하신 적 있지 않나요. 이런 일들이 실제로 있었습니다.',
  items: [
    {
      id: 'indoor-to-outdoor',
      title: '실내라고 했는데 야외로',
      body: '실내 주차로 예약해 두고도, 입고 뒤 야외로 옮기는 경우가 있습니다.',
    },
    {
      id: 'no-insurance',
      title: '보험 없이 영업',
      body: '사고·손상에 대비할 보험이 없는 채로 영업하는 업체가 있습니다.',
    },
    {
      id: 'no-lot',
      title: '주차장 없이 영업',
      body: '확보된 주차장이 없는데도 예약을 받는 경우가 있습니다.',
    },
    {
      id: 'handoff-unknown',
      title: '만차면 모르는 업체로',
      body: '자리가 없으면 돈을 받아 두고, 누군지 모르는 다른 업체에 넘기기도 합니다.',
    },
  ],
} as const;

/**
 * 홈 · 왜 에어픽인가 — 고객이 에어픽을 선택하는 이유
 * 대표 사진 1장 + 짧은 캡션 + 증거형 01~03 (사진 3장 금지)
 */
export const HOME_WHY_AIRPICK = {
  eyebrow: 'WHY AIRPICK',
  title: '왜 고객들이 에어픽을 이용할까요?',
  /** 대표 이미지 위/옆 짧은 스토리 문장 */
  caption: '차를 맡긴 순간, 여행이 시작됩니다.',
  lead:
    '에어픽은 그 불안을 검증하는 사이트입니다. 사업자·보험·주차장·운영을 확인한 파트너만 모았고, 맡긴 뒤에도 사진과 위치로 확인할 수 있습니다.',
  imageSrc: '/brand/home-why-airport-handoff.webp',
  imageFallbackSrc: '/brand/home-why-airport-handoff.jpg',
  imageAlt: '공항에서 차량을 맡기고 캐리어를 끌고 터미널로 향하는 여행객',
  items: [
    {
      id: 'curated',
      title: '사업자·보험·주차장부터 확인',
      body: '무보험·주차장 없는 영업은 걸러냅니다. 기준을 통과한 공식 파트너만 비교·예약할 수 있습니다.',
      evidence: 'AIRPICK VERIFIED',
    },
    {
      id: 'after-handoff',
      title: '실내·야외, 맡긴 뒤에도 확인',
      body: '입고 사진과 주차 위치를 예약에서 바로 봅니다. 실내라고 했다가 야외로 바뀌는지, 다른 업체로 넘어가는지 숨기지 않습니다.',
      evidence: '입고 사진 · 주차 위치',
    },
    {
      id: 'reviews',
      title: '실후기로 한 번 더 검증',
      body: '실제 이용 고객의 평가와 후기를 보고 고릅니다. 광고 문구가 아니라, 맡긴 사람들의 기록입니다.',
      evidence: '실제 이용 고객 후기',
    },
  ],
} as const;

/** 홈 · 신뢰 수치 — 검증·선별·결과 (에어픽 예약 차량 기준) */
export const HOME_TRUST_STATS = {
  insuranceValue: '100%',
  insuranceLabel: '보험 확인',
  parkingValue: '100%',
  parkingLabel: '주차장 확인',
  partnersLabel: '엄선된 공식 파트너',
  accidentValue: '0건',
  accidentLabel: '2026년 사고차량',
} as const;

/** 홈 · 여행 확장 서비스 (히어로 아래) */
export const HOME_TRAVEL_SERVICES = {
  eyebrow: 'TRAVEL SERVICES',
  title: '여행 준비도 에어픽에서',
  lead: '주차 예약 후, 출국 전에 필요한 여행 서비스를 이어서 준비할 수 있습니다.',
  esimCta: '이심 제휴 할인',
} as const;

/** 홈 · 후킹 CTA — 일정은 각 탭에서 */
export const HOME_HOOK_CTA = {
  parking: '검증 파트너 예약하기',
  esim: '이심 제휴 할인',
} as const;

/** @deprecated 홈 일정 게이트웨이 제거 후 미사용에 가깝음 */
export const HOME_EYEBROW_PREMIUM = 'PREMIUM AIRPORT SERVICES';

/** 브랜드 인트로 게이트 — 영상으로 격 올린 뒤 홈에서 후킹 */
export const BRAND_INTRO = {
  storageKey: 'airpick_intro_seen',
  /** 홈(/) 접속·새로고침마다 표시. 직링크는 스킵. 테스트: /?intro=1 */
  brand: 'AIRPICK',
  eyebrow: '인천공항 검증된 서비스',
  line: '믿을 수 있는 곳에 맡기면, 여행이 편해집니다.',
  hint: '주차대행 · 여행 준비',
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
    cta: '이심 제휴 할인',
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
  headline: '이심 제휴 할인',
  highlights: ['제휴사 할인 링크', '구매·개통은 제휴사에서', '에어픽 내 결제 없음'],
  cta: '이심 제휴 할인 보기',
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

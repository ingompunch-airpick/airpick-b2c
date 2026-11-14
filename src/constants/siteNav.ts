/** 사이트 내비 — ≡ 메뉴는 여정 섹션, 플랫 목록은 SEO·사이트링크용 */

export type SiteNavItem = {
  href: string;
  label: string;
  /** 앱 내 시트로 열 항목 (2026-11-13부터 메뉴 FAQ도 /faq/ 웹 페이지로 이동 — 예약 화면 FAQ 버튼만 시트) */
  openInApp?: 'faq';
};

export type SiteNavSection = {
  id: string;
  title: string;
  items: readonly SiteNavItem[];
};

/** ≡ 메뉴 맨 위 큰 버튼 2개 — 예약으로 바로 (앱 유입이 많아 엄지 닿는 첫 줄에) */
export const SITE_NAV_QUICK = [
  { href: '/', label: '주차대행 비교', caption: '예약하기' },
  { href: '/esim', label: '이심(eSIM)', caption: '제휴 할인' },
] as const;

/** ≡ 메뉴 · 고객용 목록 (2026-11-14 입점 페이지 스타일로 재구성) */
export const SITE_NAV_SECTIONS = [
  {
    id: 'learn',
    title: '알아보기',
    items: [
      { href: '/guides/', label: '가이드' },
      { href: '/faq/', label: '자주 묻는 질문' },
      { href: '/pricing/', label: '요금 안내' },
      { href: '/guides/parking-insurance/', label: '보험 확인하기' },
    ],
  },
  {
    id: 'airpick',
    title: '에어픽',
    items: [
      { href: '/partners/', label: '입점 업체' },
      { href: '/about/', label: '에어픽 소개' },
      { href: '/facts/', label: '사실 확인' },
    ],
  },
] as const satisfies readonly SiteNavSection[];

/** ≡ 메뉴 · 업체용 배너 → 입점 신청 페이지 (카카오·메일 문의는 그 페이지 안에) */
export const SITE_NAV_JOIN = {
  href: '/join',
  caption: '업체 사장님이신가요?',
  title: '에어픽 입점 신청',
  body: '무료 입점 상담부터 시작하세요.',
  cta: '입점 신청하기',
} as const;

/** ≡ 메뉴 맨 아래 작은 글씨 */
export const SITE_NAV_LEGAL = [
  { href: '/terms/', label: '이용약관' },
  { href: '/refund/', label: '취소·환불' },
  { href: '/privacy/', label: '개인정보처리방침' },
] as const;

/** 플랫 목록 (사이트링크·크롤용) — 섹션에서 메일·중복 제외 */
export const SITE_NAV_PRIMARY = [
  { href: '/parking', label: '주차대행' },
  { href: '/esim', label: '이심' },
  { href: '/guides/', label: '가이드' },
  { href: '/partners/', label: '입점 업체' },
  { href: '/faq/', label: 'FAQ' },
] as const;

export const SITE_NAV_SECONDARY = [
  { href: '/about/', label: '에어픽 소개' },
  { href: '/facts/', label: '사실 확인' },
  { href: '/pricing/', label: '요금 안내' },
  { href: '/terms/', label: '이용약관' },
  { href: '/refund/', label: '취소·환불 정책' },
  { href: '/privacy/', label: '개인정보처리방침' },
] as const;

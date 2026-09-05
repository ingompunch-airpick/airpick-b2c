/** 사이트 내비 — ≡ 메뉴는 여정 섹션, 플랫 목록은 SEO·사이트링크용 */

export type SiteNavItem = {
  href: string;
  label: string;
  /** FAQ는 앱 내 시트, 나머지는 웹 페이지 */
  openInApp?: 'faq';
};

export type SiteNavSection = {
  id: string;
  title: string;
  items: readonly SiteNavItem[];
};

/** ≡ 메뉴 · 사용자 여정 섹션 (유심사 「더보기」 참고) */
export const SITE_NAV_SECTIONS = [
  {
    id: 'use',
    title: '이용 안내',
    items: [
      { href: '/parking', label: '주차대행 비교' },
      { href: '/esim', label: '이심(eSIM) 비교' },
      { href: '/guides/', label: '가이드' },
      { href: '/faq/', label: 'FAQ', openInApp: 'faq' },
    ],
  },
  {
    id: 'trust',
    title: '입점·신뢰',
    items: [
      { href: '/partners/', label: '입점 업체' },
      { href: '/guides/partner-vs-external/', label: '입점과 미입점, 뭐가 다른가요?' },
      { href: '/guides/parking-insurance/', label: '보험, 예약 전에 뭘 확인하나요?' },
    ],
  },
  {
    id: 'business',
    title: '비즈니스',
    items: [
      { href: '/for-partners/', label: '입점사 배지' },
      { href: 'mailto:partner', label: '입점 · 제휴 문의' },
    ],
  },
  {
    id: 'service',
    title: '서비스 정보',
    items: [
      { href: '/about/', label: '에어픽 소개' },
      { href: '/facts/', label: '사실 확인' },
      { href: '/privacy/', label: '개인정보처리방침' },
    ],
  },
] as const satisfies readonly SiteNavSection[];

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
  { href: '/for-partners/', label: '입점사 배지' },
  { href: '/privacy/', label: '개인정보처리방침' },
] as const;

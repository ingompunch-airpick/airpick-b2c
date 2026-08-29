/** 사이트링크·크롤용 고정 내비 (≡ 메뉴·정적 페이지와 동일 순서) */
/** 이심은 앱 탭 — 공개 내비에도 노출 */

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

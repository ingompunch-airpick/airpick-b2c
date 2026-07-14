/** 사이트링크·크롤용 고정 내비 (푸터·메뉴·정적 페이지와 동일 순서 유지) */

export const SITE_NAV_PRIMARY = [
  { href: '/parking', label: '주차 비교' },
  { href: '/esim', label: '유심·eSIM' },
  { href: '/guides/', label: '가이드' },
  { href: '/partners/', label: '입점 업체' },
  { href: '/faq/', label: 'FAQ' },
] as const;

export const SITE_NAV_SECONDARY = [
  { href: '/about/', label: '에어픽 소개' },
  { href: '/for-partners/', label: '입점사 배지' },
  { href: '/privacy/', label: '개인정보처리방침' },
] as const;

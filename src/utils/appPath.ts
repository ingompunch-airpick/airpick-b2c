import type { AppTab } from '../types';

/** 앱 탭 ↔ 공개 URL (SEO·공유용) */
export const TAB_PATH: Record<AppTab, string> = {
  home: '/',
  compare: '/parking',
  esim: '/esim',
  my: '/my',
};

export function normalizePathname(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '') || '/';
}

/** pathname → 탭. 앱 탭이 아니면 null */
export function tabFromPathname(pathname: string): AppTab | null {
  const path = normalizePathname(pathname);
  if (path === '/') return 'home';
  if (path === '/parking') return 'compare';
  if (path === '/esim') return 'esim';
  if (path === '/my') return 'my';
  return null;
}

export function pathFromTab(tab: AppTab): string {
  return TAB_PATH[tab];
}

/** 브라우저 주소만 맞추기 (React state는 호출 측에서 갱신) */
export function syncUrlToTab(tab: AppTab, mode: 'push' | 'replace' = 'push'): void {
  const next = pathFromTab(tab);
  const current = normalizePathname(window.location.pathname);
  if (current === normalizePathname(next)) return;
  if (mode === 'replace') {
    window.history.replaceState({ tab }, '', next);
  } else {
    window.history.pushState({ tab }, '', next);
  }
}

export function readInitialTab(): AppTab {
  return tabFromPathname(window.location.pathname) ?? 'home';
}

/** `/my?review={reservationId}` — 출고 알림톡 후기 딥링크 */
export function readReviewReservationId(): string | null {
  if (typeof window === 'undefined') return null;
  if (normalizePathname(window.location.pathname) !== '/my') return null;
  const id = new URLSearchParams(window.location.search).get('review')?.trim();
  return id || null;
}

/** 후기 딥링크 처리 후 쿼리만 제거 (/my 유지) */
export function clearReviewQueryParam(): void {
  if (typeof window === 'undefined') return;
  if (normalizePathname(window.location.pathname) !== '/my') return;
  if (!new URLSearchParams(window.location.search).has('review')) return;
  window.history.replaceState({ tab: 'my' }, '', '/my');
}

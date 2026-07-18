import type { AppTab } from '../types';

/** 앱 탭 ↔ 공개 URL (SEO·공유용) */
export const TAB_PATH: Record<AppTab, string> = {
  home: '/',
  compare: '/parking',
  esim: '/esim',
  my: '/my',
};

/** 정적 HTML SEO 문서 (React 앱 탭이 아님) */
const SEO_DOCUMENT_PREFIXES = [
  '/guides',
  '/partners',
  '/faq',
  '/about',
  '/privacy',
  '/facts',
  '/for-partners',
  '/badges',
] as const;

export function normalizePathname(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '') || '/';
}

export function isSeoDocumentPath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  return SEO_DOCUMENT_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
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

/**
 * 오래된 SW가 SEO URL에 SPA(index)를 준 경우 복구.
 * @returns true면 리로드 진행 중이라 React를 마운트하지 말 것
 */
export async function recoverStolenSeoDocument(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!isSeoDocumentPath(window.location.pathname)) return false;

  const spaShell =
    Boolean(document.getElementById('root')) && !document.querySelector('nav.topnav');
  if (!spaShell) return false;

  const key = `seo-recover:${normalizePathname(window.location.pathname)}`;
  if (sessionStorage.getItem(key) === '1') return false;
  sessionStorage.setItem(key, '1');

  try {
    const regs = (await navigator.serviceWorker?.getRegistrations()) ?? [];
    await Promise.all(regs.map((r) => r.unregister()));
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch {
    /* ignore — still reload */
  }

  window.location.reload();
  return true;
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

/** `/parking?company={id}` — 홈 지도 허브 → 비교 프리필 */
export function readParkingCompanyId(): string | null {
  if (typeof window === 'undefined') return null;
  if (normalizePathname(window.location.pathname) !== '/parking') return null;
  const id = new URLSearchParams(window.location.search).get('company')?.trim();
  return id || null;
}

export function clearParkingCompanyQuery(): void {
  if (typeof window === 'undefined') return;
  if (normalizePathname(window.location.pathname) !== '/parking') return;
  if (!new URLSearchParams(window.location.search).has('company')) return;
  window.history.replaceState({ tab: 'compare' }, '', '/parking');
}

/** `/esim?country=JP` */
export function readEsimCountryCode(): string | null {
  if (typeof window === 'undefined') return null;
  if (normalizePathname(window.location.pathname) !== '/esim') return null;
  const code = new URLSearchParams(window.location.search).get('country')?.trim().toUpperCase();
  return code || null;
}

export function pathForParking(companyId?: string): string {
  if (!companyId) return '/parking';
  return `/parking?company=${encodeURIComponent(companyId)}`;
}

export function pathForEsim(countryCode?: string): string {
  if (!countryCode) return '/esim';
  return `/esim?country=${encodeURIComponent(countryCode)}`;
}

import { logEvent, type Analytics } from 'firebase/analytics';

let analytics: Analytics | null = null;

export function initAnalytics(instance: Analytics): void {
  analytics = instance;
}

function track(name: string, params?: Record<string, string | number>): void {
  if (!analytics) return;
  try {
    logEvent(analytics, name, params);
  } catch {
    // Analytics blocked or unavailable
  }
}

export function hostFromUrl(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url.slice(0, 100);
  }
}

/** 하단 탭 · 화면 전환 */
export function trackTabView(tab: string): void {
  track('tab_view', { tab_name: tab });
}

/** 홈·예약 탭 등 CTA 버튼 */
export function trackCtaClick(action: string, location: string): void {
  track('cta_click', { action, location });
}

/** 외부 사이트·제휴 페이지 이동 */
export function trackOutboundClick(params: {
  category: 'parking_external' | 'esim_partner' | 'email' | 'phone' | 'map';
  destination: string;
  itemId?: string;
  itemName?: string;
}): void {
  track('outbound_click', {
    link_category: params.category,
    link_destination: params.destination.slice(0, 100),
    ...(params.itemId ? { item_id: params.itemId } : {}),
    ...(params.itemName ? { item_name: params.itemName.slice(0, 100) } : {}),
  });
}

/** 입점 주차대행 — 예약 모달 열기 */
export function trackParkingBookStart(companyId: string, companyName: string): void {
  track('parking_book_start', {
    company_id: companyId,
    company_name: companyName.slice(0, 100),
  });
}

/** 입점 주차대행 — 예약 접수 완료 */
export function trackParkingBookComplete(companyId: string, companyName: string): void {
  track('parking_book_complete', {
    company_id: companyId,
    company_name: companyName.slice(0, 100),
  });
}

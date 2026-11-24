import { logEvent, type Analytics } from 'firebase/analytics';
import { firebaseConfig } from '../config/firebase';

let analytics: Analytics | null = null;

const GA4_MEASUREMENT_ID = firebaseConfig.measurementId;
const purchaseFired = new Set<string>();

type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFn;
    __airpickGa4Configured?: boolean;
  }
}

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

/** G-258 이미 Firebase Analytics로 있으면 재로드하지 않음. /h/ 등에서만 스크립트 보강. */
export function ensureAirpickGa4(measurementId: string = GA4_MEASUREMENT_ID): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const id = measurementId.trim();
  if (!id) return;

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
  }

  if (window.__airpickGa4Configured) return;
  if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${id}"]`)) {
    window.__airpickGa4Configured = true;
    return;
  }
  // Firebase Analytics가 이미 gtag를 심은 경우 config만 중복 방지
  if (analytics || document.querySelector('script[src*="firebase"]')) {
    window.__airpickGa4Configured = true;
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
  window.gtag('js', new Date());
  window.gtag('config', id);
  window.__airpickGa4Configured = true;
}

export type PurchaseBookingPath = 'vendor_page' | 'airpick_main';
export type PurchaseBookingMethod = 'kakao' | 'guest' | 'vendor_form';

/** 예약 저장 성공 직후 1회. 실패·취소·재방문·새로고침 시 재전송 안 함. */
export function trackPurchaseOnce(opts: {
  transactionId: string;
  value: number;
  vendor: string;
  vendorName: string;
  bookingPath: PurchaseBookingPath;
  bookingMethod: PurchaseBookingMethod;
}): boolean {
  if (typeof window === 'undefined') return false;
  const transactionId = String(opts.transactionId || '').trim();
  const vendor = String(opts.vendor || '')
    .trim()
    .toLowerCase();
  const vendorName = String(opts.vendorName || '').trim() || vendor;
  const value = Number(opts.value);
  if (!transactionId || !vendor || !Number.isFinite(value) || value < 0) return false;

  const storageKey = `ga4.purchase.${transactionId}`;
  if (purchaseFired.has(transactionId)) return false;
  try {
    if (sessionStorage.getItem(storageKey)) {
      purchaseFired.add(transactionId);
      return false;
    }
    sessionStorage.setItem(storageKey, '1');
  } catch {
    /* private mode — 메모리 Set만 */
  }
  purchaseFired.add(transactionId);

  ensureAirpickGa4();

  const payload = {
    transaction_id: transactionId,
    value,
    currency: 'KRW',
    vendor,
    booking_path: opts.bookingPath,
    booking_method: opts.bookingMethod,
    items: [
      {
        item_id: vendor,
        item_name: vendorName.slice(0, 100),
        price: value,
        quantity: 1,
      },
    ],
  };

  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'purchase', payload);
      return true;
    }
    if (analytics) {
      logEvent(analytics, 'purchase', payload as Record<string, unknown> as never);
      return true;
    }
  } catch {
    // Analytics blocked — 예약은 유지
  }
  return false;
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

/** OpenAI 광고 — 예약 저장이 끝난 뒤에만 호출 */
export function trackAppointmentScheduled(): void {
  const oaiq = (window as Window & { oaiq?: (...args: unknown[]) => void }).oaiq;
  if (typeof oaiq !== 'function') return;
  try {
    oaiq('measure', 'appointment_scheduled', { type: 'customer_action' });
  } catch {
    // 픽셀이 막혀 있으면 예약 자체는 그대로 둔다
  }
}

/** 입점 주차대행 — 예약 접수 완료 */
export function trackParkingBookComplete(companyId: string, companyName: string): void {
  track('parking_book_complete', {
    company_id: companyId,
    company_name: companyName.slice(0, 100),
  });
}

/** 퍼널 2단계 — 손님이 일정·조건을 직접 바꿈 (세션당 1회) */
let scheduleInputTracked = false;
export function trackScheduleInput(field: string): void {
  if (scheduleInputTracked) return;
  scheduleInputTracked = true;
  track('parking_schedule_input', { field });
}

/** 퍼널 4단계 — 업체 상세 열기 */
export function trackParkingDetailView(companyId: string, companyName: string): void {
  track('parking_detail_view', {
    company_id: companyId,
    company_name: companyName.slice(0, 100),
  });
}

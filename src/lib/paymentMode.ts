import { APP_CONFIG } from '../constants/appConfig';
import { isPortoneEnabled } from './portonePayment';

const REVIEW_FLAG_KEY = 'airpick.payreview';
const PAYTEST_FLAG_KEY = 'airpick.paytest';
/** test 모드 실결제 시험 업체 (B2B Functions PAYMENT_TEST_COMPANY_IDS 와 같게) */
export const PAYMENT_TEST_COMPANY_IDS = ['demo'];
const SUMMARY_KEY = 'airpick.paySummary';

/**
 * `?payreview=1` 로 들어오면 이 탭(세션) 동안 심사용 결제 단계를 켠다.
 * `?payreview=0` 이면 끈다. 앱 시작 시 한 번 호출.
 */
export function rememberPaymentReviewFlag(): void {
  try {
    const v = new URLSearchParams(window.location.search).get('payreview');
    if (v === '1') sessionStorage.setItem(REVIEW_FLAG_KEY, '1');
    else if (v === '0') sessionStorage.removeItem(REVIEW_FLAG_KEY);
    const t = new URLSearchParams(window.location.search).get('paytest');
    if (t === '1') sessionStorage.setItem(PAYTEST_FLAG_KEY, '1');
    else if (t === '0') sessionStorage.removeItem(PAYTEST_FLAG_KEY);
  } catch {
    /* storage 차단 환경 — 무시 */
  }
}

function hasReviewFlag(): boolean {
  try {
    if (new URLSearchParams(window.location.search).get('payreview') === '1') return true;
    return sessionStorage.getItem(REVIEW_FLAG_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * 결제 단계 노출 여부.
 * off: 안 보임 / test: `?payreview=1` 세션만 / live: 모두.
 * 포트원 키가 없으면 항상 false.
 */
export function isPaymentStepVisible(): boolean {
  if (!isPortoneEnabled()) return false;
  const mode = APP_CONFIG.paymentMode;
  if (mode === 'live') return true;
  if (mode === 'test') return hasReviewFlag() || hasPayTestFlag();
  return false;
}

/** `?paytest=1` — 내부 실결제 시험(테스트 채널 + demo 업체) */
export function hasPayTestFlag(): boolean {
  try {
    if (new URLSearchParams(window.location.search).get('paytest') === '1') return true;
    return sessionStorage.getItem(PAYTEST_FLAG_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * 실제 예약 + 서버 결제 확인 흐름을 쓰는지.
 * live: 모든 업체 / test: `?paytest=1` + demo 업체만 / 그 외(심사용 `?payreview=1`)는 예약 없이 결제창만.
 */
export function isLivePaymentFlow(companyId: string): boolean {
  if (!isPortoneEnabled()) return false;
  const mode = APP_CONFIG.paymentMode;
  if (mode === 'live') return true;
  if (mode === 'test') return hasPayTestFlag() && PAYMENT_TEST_COMPANY_IDS.includes(companyId);
  return false;
}

export function isTestPaymentMode(): boolean {
  return APP_CONFIG.paymentMode !== 'live';
}

/** 결제 완료 화면에 보여줄 주문 요약 (결제 요청 직전 저장) */
export interface PaySummary {
  paymentId: string;
  orderName: string;
  amount: number;
  companyName: string;
  schedule: string;
  /** 실결제 흐름 — 확인·재시도용 */
  reservationId?: string;
  bookingNo?: string;
  buyerName?: string;
  buyerPhone?: string;
  buyerEmail?: string;
}

export function savePaySummary(summary: PaySummary): void {
  try {
    sessionStorage.setItem(SUMMARY_KEY, JSON.stringify(summary));
  } catch {
    /* 무시 */
  }
}

export function readPaySummary(paymentId: string | null): PaySummary | null {
  try {
    const raw = sessionStorage.getItem(SUMMARY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PaySummary;
    if (paymentId && parsed.paymentId !== paymentId) return null;
    return parsed;
  } catch {
    return null;
  }
}

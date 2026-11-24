import { APP_CONFIG } from '../constants/appConfig';
import { isPortoneEnabled } from './portonePayment';

const REVIEW_FLAG_KEY = 'airpick.payreview';
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
  if (mode === 'test') return hasReviewFlag();
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

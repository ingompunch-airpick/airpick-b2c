import { auth } from '../firebase';
import { ensureAnonymousAuth } from './reservations';

/** B2B Functions `reservationPayment` (Hosting rewrite) */
const PAYMENT_API_PATH = '/api/payment';

export type PreparedPayment =
  | { paymentId: string; amount: number; holdUntil: string }
  | { paid: true; amount: 0 };

export type PaymentConfirmState =
  | 'paid'
  | 'pending'
  | 'failed'
  | 'refunded_late'
  | 'refunded_duplicate'
  | 'refunded_mismatch'
  | 'unknown';

const PREPARE_ERRORS: Record<string, string> = {
  not_found: '해당 시간대가 방금 마감됐어요. 다른 시간이나 업체로 다시 예약해 주세요.',
  forbidden: '예약한 기기에서 결제해 주세요.',
  expired: '결제 시간(15분)이 지났어요. 처음부터 다시 예약해 주세요.',
  already_paid: '이미 결제된 예약입니다. 내 예약에서 확인해 주세요.',
  cancelled: '취소된 예약입니다. 처음부터 다시 예약해 주세요.',
  price_mismatch: '요금이 바뀌었어요. 처음부터 다시 예약해 주세요.',
};

/** 결제창 열기 전 — 서버가 금액과 결제번호를 정한다 */
export async function prepareReservationPayment(reservationId: string): Promise<PreparedPayment> {
  await ensureAnonymousAuth();
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(PAYMENT_API_PATH, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ action: 'prepare', id: reservationId }),
  });
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (res.ok) return body as PreparedPayment;
  const code = String(body.error || '');
  throw new Error(PREPARE_ERRORS[code] || '결제를 준비하지 못했어요. 잠시 후 다시 시도해 주세요.');
}

/** 결제 후 — 서버가 포트원에 실제 결제를 확인한다 */
export async function confirmReservationPayment(
  paymentId: string
): Promise<{ state: PaymentConfirmState; reservationId?: string; bookingNo?: string }> {
  const res = await fetch(PAYMENT_API_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'confirm', paymentId }),
  });
  if (!res.ok) return { state: 'pending' };
  return (await res.json()) as { state: PaymentConfirmState; reservationId?: string; bookingNo?: string };
}

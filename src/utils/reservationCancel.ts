import { RESERVATION_CREATED_BY } from '../constants/reservationSource';
import type { Company, Reservation } from '../types';

/** 업체 미지정 시 기본 취소 마감 — 입고 O시간 전 */
export const DEFAULT_CANCEL_CUTOFF_HOURS = 24;

/** 셀프 취소 가능한 상태 (입고 전) */
const CANCELLABLE_STATUSES = new Set(['pending', 'scheduled', 'pending_in']);

export function getCancelCutoffHours(company?: Company): number {
  const raw = company?.cancelCutoffHours;
  if (typeof raw === 'number' && Number.isFinite(raw) && raw >= 0) return raw;
  return DEFAULT_CANCEL_CUTOFF_HOURS;
}

/** 입고 예정 시각 (Date) — 파싱 실패 시 null */
export function parseCheckInDate(reservation: Reservation): Date | null {
  const { departureDate, departureTime } = reservation;
  if (!departureDate) return null;
  const time = /^\d{2}:\d{2}$/.test(departureTime) ? departureTime : '00:00';
  const dt = new Date(`${departureDate}T${time}:00`);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export interface CancelEligibility {
  cancellable: boolean;
  /** 사용자 안내 문구 */
  reason?: string;
}

/** 에어픽 직접 예약 · 입고 마감 전만 셀프 취소 허용 */
export function getCancelEligibility(
  reservation: Reservation,
  company: Company | undefined,
  now: Date = new Date()
): CancelEligibility {
  if (reservation.status === 'cancelled') {
    return { cancellable: false, reason: '이미 취소된 예약입니다.' };
  }
  if (reservation.createdBy !== RESERVATION_CREATED_BY.AIRPICK_B2C) {
    return {
      cancellable: false,
      reason: '이 예약은 예약하신 경로에서 취소해 주세요.',
    };
  }
  if (!CANCELLABLE_STATUSES.has(reservation.status)) {
    return {
      cancellable: false,
      reason: '입고 이후에는 앱에서 취소할 수 없습니다. 업체로 문의해 주세요.',
    };
  }

  const checkIn = parseCheckInDate(reservation);
  if (!checkIn) return { cancellable: true };

  const cutoffHours = getCancelCutoffHours(company);
  const deadline = new Date(checkIn.getTime() - cutoffHours * 60 * 60 * 1000);
  if (now > deadline) {
    return {
      cancellable: false,
      reason: `입고 ${cutoffHours}시간 전까지만 앱에서 취소할 수 있습니다. 업체로 문의해 주세요.`,
    };
  }

  return { cancellable: true };
}

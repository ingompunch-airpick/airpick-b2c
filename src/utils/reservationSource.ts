import { RESERVATION_CREATED_BY } from '../constants/reservationSource';
import type { Reservation } from '../types';

/** 입고 위치·사진·보험 상세 — 에어픽 B2C 직접 예약만 */
export function hasAirpickTrackingAccess(reservation: Reservation): boolean {
  return reservation.createdBy === RESERVATION_CREATED_BY.AIRPICK_B2C;
}

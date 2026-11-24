import { APP_CONFIG } from '../constants/appConfig';
import { formatYmd, todayYmd } from './dates';

function parseYmdLocal(ymd: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(ymd || '').trim());
  if (!m) return null;
  const dt = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(dt.getTime()) ? null : dt;
}

/** 달력 기준 N개월 후 YYYY-MM-DD */
export function addCalendarMonthsYmd(ymd: string, months: number): string {
  const dt = parseYmdLocal(ymd);
  if (!dt) return ymd;
  const day = dt.getDate();
  dt.setMonth(dt.getMonth() + months);
  // 말일 오버플로 보정 (1/31 + 1개월 등)
  if (dt.getDate() < day) dt.setDate(0);
  return formatYmd(dt);
}

/** 달력 일수 차이 (출고 − 입고). 같은 날 0 */
export function calendarDayDiff(startYmd: string, endYmd: string): number | null {
  const s = parseYmdLocal(startYmd);
  const e = parseYmdLocal(endYmd);
  if (!s || !e) return null;
  s.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

export function maxDepartureYmd(today = todayYmd()): string {
  return addCalendarMonthsYmd(today, APP_CONFIG.maxAdvanceMonths);
}

/** 입고일 기준 출고 상한 (입고 + maxParkingDayDiff) */
export function maxArrivalYmd(departureYmd: string): string {
  const dt = parseYmdLocal(departureYmd);
  if (!dt) return departureYmd;
  dt.setDate(dt.getDate() + APP_CONFIG.maxParkingDayDiff);
  return formatYmd(dt);
}

export type BookingWindowCheck =
  | { allowed: true }
  | { allowed: false; reason: 'past' | 'order' | 'advance' | 'stay' };

/** B2C 예약 기간 — UI·저장 직전·서버와 동일 기준(달력 6개월·90일 차이) */
export function checkBookingWindow(
  departureDate: string,
  arrivalDate: string,
  today = todayYmd()
): BookingWindowCheck {
  const dep = String(departureDate || '').trim().slice(0, 10);
  const arr = String(arrivalDate || '').trim().slice(0, 10);
  if (!dep || !arr) return { allowed: false, reason: 'order' };
  if (arr < dep) return { allowed: false, reason: 'order' };
  if (dep < today) return { allowed: false, reason: 'past' };
  if (dep > maxDepartureYmd(today)) return { allowed: false, reason: 'advance' };
  const diff = calendarDayDiff(dep, arr);
  if (diff == null || diff > APP_CONFIG.maxParkingDayDiff) {
    return { allowed: false, reason: 'stay' };
  }
  return { allowed: true };
}

export function bookingWindowMessage(
  check: Exclude<BookingWindowCheck, { allowed: true }>
): string {
  switch (check.reason) {
    case 'advance':
      return APP_CONFIG.bookingAdvanceBlockedMessage;
    case 'stay':
      return APP_CONFIG.bookingStayBlockedMessage;
    case 'past':
      return '맡기는 날은 오늘 이후로 선택해 주세요.';
    default:
      return '찾는 날은 맡기는 날 이후로 선택해 주세요.';
  }
}

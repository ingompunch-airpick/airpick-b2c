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

export type BookingTimeCheck =
  | { ok: true; hoursUntilCheckIn: number }
  | { ok: false; reason: 'pastTime' | 'timeOrder'; message: string };

/**
 * 시각까지 본 확인 — 날짜만 보는 checkBookingWindow로는
 * 「오늘 10시(이미 지남)」나 「같은 날 찾는 시간이 맡기는 시간보다 이름」을 못 걸러서 추가.
 * 한국 시간 기준.
 */
export function checkBookingTimes(
  search: { departureDate: string; departureTime: string; arrivalDate: string; arrivalTime: string },
  now: Date = new Date()
): BookingTimeCheck {
  const toKst = (ymd: string, hm: string): Date | null => {
    const d = String(ymd || '').trim().slice(0, 10);
    const t = String(hm || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || !/^\d{2}:\d{2}$/.test(t)) return null;
    const dt = new Date(`${d}T${t}:00+09:00`);
    return Number.isNaN(dt.getTime()) ? null : dt;
  };
  const dep = toKst(search.departureDate, search.departureTime);
  const arr = toKst(search.arrivalDate, search.arrivalTime);
  if (!dep || !arr) {
    return { ok: false, reason: 'timeOrder', message: '맡기는 날짜·시간과 찾는 날짜·시간을 골라 주세요.' };
  }
  if (dep.getTime() <= now.getTime()) {
    return { ok: false, reason: 'pastTime', message: '맡기는 시간이 이미 지났어요. 시간을 다시 골라 주세요.' };
  }
  if (arr.getTime() <= dep.getTime()) {
    return { ok: false, reason: 'timeOrder', message: '찾는 시간은 맡기는 시간 이후로 골라 주세요.' };
  }
  return { ok: true, hoursUntilCheckIn: (dep.getTime() - now.getTime()) / 3_600_000 };
}

function addDaysYmd(ymd: string, days: number): string {
  const dt = parseYmdLocal(ymd);
  if (!dt) return ymd;
  dt.setDate(dt.getDate() + days);
  return formatYmd(dt);
}

/**
 * 맡기는 날을 바꿀 때 찾는 날 맞추기 — 기존 일정 길이를 그대로 유지한다.
 * (전에는 찾는 날이 맡기는 날과 같아져서 「찾는 시간은 맡기는 시간 이후로」 오류가 떴다. 2026-11-28)
 * 원래 일정이 없거나 이상하면 하루 뒤. 최대 기간을 넘으면 상한으로.
 */
export function arrivalForNewDeparture(
  prevDeparture: string,
  prevArrival: string,
  nextDeparture: string
): string {
  const diff = calendarDayDiff(prevDeparture, prevArrival);
  const keep = diff != null && diff >= 1 ? diff : 1;
  const arr = addDaysYmd(nextDeparture, keep);
  const max = maxArrivalYmd(nextDeparture);
  return arr > max ? max : arr;
}

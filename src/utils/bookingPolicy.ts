import { formatDateDisplay, todayYmd } from './dates';

/** 입고일~출고일 사이 모든 날짜 (YYYY-MM-DD, 로컬 기준) */
export function datesInRange(startYmd: string, endYmd: string): string[] {
  const parse = (ymd: string) => {
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };

  const start = parse(startYmd);
  const end = parse(endYmd);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return [startYmd];

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const dates: string[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export type BookingPolicyCheck =
  | { allowed: true }
  | { allowed: false; reason: 'closed' }
  | { allowed: false; reason: 'same_day' }
  | { allowed: false; reason: 'blocked'; blockedDates: string[] };

export function checkBookingPolicy(
  departureDate: string,
  arrivalDate: string,
  isOpen: boolean,
  blockedDates: string[],
  sameDayBookingBlocked = false
): BookingPolicyCheck {
  if (!isOpen) return { allowed: false, reason: 'closed' };

  if (sameDayBookingBlocked && departureDate === todayYmd()) {
    return { allowed: false, reason: 'same_day' };
  }

  const span = datesInRange(departureDate, arrivalDate);
  const blocked = span.filter((d) => blockedDates.includes(d));
  if (blocked.length > 0) {
    return { allowed: false, reason: 'blocked', blockedDates: blocked };
  }

  return { allowed: true };
}

export function bookingPolicyMessage(
  check: Exclude<BookingPolicyCheck, { allowed: true }>,
  departureDate: string,
  arrivalDate: string
): string {
  if (check.reason === 'closed') {
    return '현재 이 업체는 전체 예약이 마감된 상태입니다.';
  }

  if (check.reason === 'same_day') {
    return '이 업체는 당일 예약을 받지 않습니다. 다른 날짜를 선택하거나 업체로 문의해 주세요.';
  }

  const dep = formatDateDisplay(departureDate);
  const arr = formatDateDisplay(arrivalDate);
  const days = check.blockedDates.map(formatDateDisplay).join(', ');
  return `선택하신 기간(${dep} ~ ${arr})에 예약 마감된 날(${days})이 포함되어 있습니다.`;
}

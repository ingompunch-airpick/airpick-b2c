/** 손님용 예약번호 AP-MMDD-XXXX (0/O/1/I 제외) */

const BOOKING_NO_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export const BOOKING_NO_RE = /^AP-\d{4}-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/;

function kstMonthDay(d = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);
  const month = parts.find((p) => p.type === 'month')?.value ?? '01';
  const day = parts.find((p) => p.type === 'day')?.value ?? '01';
  return `${month}${day}`;
}

function randomSuffix(len = 4): string {
  const bytes = new Uint8Array(len);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < len; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let out = '';
  for (let i = 0; i < len; i++) {
    out += BOOKING_NO_ALPHABET[bytes[i]! % BOOKING_NO_ALPHABET.length];
  }
  return out;
}

/** AP-MMDD-XXXX 생성 (문서 ID와 별개) */
export function generateBookingNo(now = new Date()): string {
  return `AP-${kstMonthDay(now)}-${randomSuffix(4)}`;
}

export function normalizeBookingNoInput(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '');
}

export function isBookingNoQuery(raw: string): boolean {
  return BOOKING_NO_RE.test(normalizeBookingNoInput(raw));
}

/** 완료·내 예약 표시: bookingNo 우선, 없으면 문서 id */
export function displayReservationCode(reservation: {
  id: string;
  bookingNo?: string | null;
}): string {
  const no = (reservation.bookingNo || '').trim();
  if (no && BOOKING_NO_RE.test(no)) return no;
  return reservation.id;
}

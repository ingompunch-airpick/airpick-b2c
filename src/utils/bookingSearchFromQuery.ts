import type { BookingSearch, Terminal } from '../types';
import { defaultBookingSearch } from './dates';

function parseTerminal(raw: string | null): Terminal | null {
  const v = (raw || '').trim().toUpperCase();
  if (v === 'T1' || v === '1') return 'T1';
  if (v === 'T2' || v === '2') return 'T2';
  return null;
}

function parseIndoor(raw: string | null): boolean | null {
  const v = (raw || '').trim().toLowerCase();
  if (!v) return null;
  if (['indoor', 'in', '실내', 'true', '1'].includes(v)) return true;
  if (['outdoor', 'out', '야외', 'false', '0'].includes(v)) return false;
  return null;
}

function parseFaceToFace(raw: string | null): boolean | null {
  const v = (raw || '').trim().toLowerCase();
  if (!v) return null;
  if (['face', 'facetoface', 'face_to_face', 'curbside', 'valet', 'meet', '대면'].includes(v)) {
    return true;
  }
  if (['self', 'drop', '비대면', 'none'].includes(v)) return false;
  return null;
}

/** `YYYY-MM-DD` / `YYYY-MM-DDTHH:mm` / `YYYY-MM-DD HH:mm` */
function parseDateTime(raw: string | null): { date?: string; time?: string } {
  const s = (raw || '').trim();
  if (!s) return {};
  const m = s.match(
    /^(\d{4})[./-](\d{1,2})[./-](\d{1,2})(?:[T\s]+(\d{1,2}):(\d{2}))?/
  );
  if (!m) return {};
  const date = `${m[1]}-${m[2]!.padStart(2, '0')}-${m[3]!.padStart(2, '0')}`;
  if (m[4] != null && m[5] != null) {
    const hh = Math.min(23, Math.max(0, Number(m[4])));
    const mm = Math.min(59, Math.max(0, Number(m[5])));
    return { date, time: `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}` };
  }
  return { date };
}

export type BookingQueryPrefill = {
  search: BookingSearch;
  /** partner 또는 company 쿼리 */
  partnerId: string | null;
  /** 쿼리로 하나라도 덮어썼는지 */
  patched: boolean;
};

/**
 * URL 쿼리로 검색·예약 폼 프리필.
 * 지원: terminal, parking, service, in, out, partner(·company)
 */
export function bookingSearchFromQuery(
  params: URLSearchParams,
  base: BookingSearch = defaultBookingSearch()
): BookingQueryPrefill {
  const next: BookingSearch = { ...base };
  let patched = false;

  const terminal = parseTerminal(params.get('terminal'));
  if (terminal) {
    next.terminal = terminal;
    next.arrivalTerminal = terminal;
    patched = true;
  }

  const indoor = parseIndoor(params.get('parking'));
  if (indoor != null) {
    next.isIndoor = indoor;
    patched = true;
  }

  const face = parseFaceToFace(params.get('service'));
  if (face != null) {
    next.faceToFace = face;
    patched = true;
  }

  const dep = parseDateTime(params.get('in'));
  if (dep.date) {
    next.departureDate = dep.date;
    patched = true;
  }
  if (dep.time) {
    next.departureTime = dep.time;
    patched = true;
  }

  const arr = parseDateTime(params.get('out'));
  if (arr.date) {
    next.arrivalDate = arr.date;
    patched = true;
  }
  if (arr.time) {
    next.arrivalTime = arr.time;
    patched = true;
  }

  if (next.arrivalDate < next.departureDate) {
    next.arrivalDate = next.departureDate;
  }

  const partnerId =
    params.get('partner')?.trim() || params.get('company')?.trim() || null;

  if (partnerId) patched = true;

  return { search: next, partnerId, patched };
}

export function readBookingQueryPrefill(): BookingQueryPrefill {
  if (typeof window === 'undefined') {
    return { search: defaultBookingSearch(), partnerId: null, patched: false };
  }
  return bookingSearchFromQuery(new URLSearchParams(window.location.search));
}

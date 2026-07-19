/** 출국 동선 최근 조회 — 기기 localStorage (예약과 무관) */
import {
  normalizeTransportMode,
  type CarParkingType,
  type TransportMode,
} from '../utils/departureGuide';

const STORAGE_KEY = 'airpick.departureGuide.recent.v1';
const MAX_ITEMS = 8;

export interface RecentDepartureGuide {
  flightId: string;
  date: string; // YYYYMMDD
  mode: TransportMode;
  parking?: CarParkingType;
  airline?: string | null;
  terminal?: string | null;
  checkInCounter?: string | null;
  savedAt: number;
}

export function loadRecentDepartureGuides(): RecentDepartureGuide[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (x): x is Record<string, unknown> =>
          !!x && typeof x === 'object' && typeof (x as { flightId?: unknown }).flightId === 'string'
      )
      .map((x) => ({
        flightId: String(x.flightId),
        date: String(x.date ?? ''),
        mode: normalizeTransportMode(x.mode),
        parking: x.parking as CarParkingType | undefined,
        airline: (x.airline as string | null | undefined) ?? null,
        terminal: (x.terminal as string | null | undefined) ?? null,
        checkInCounter: (x.checkInCounter as string | null | undefined) ?? null,
        savedAt: typeof x.savedAt === 'number' ? x.savedAt : 0,
      }))
      .filter((x) => x.flightId.length > 0);
  } catch {
    return [];
  }
}
export function saveRecentDepartureGuide(entry: Omit<RecentDepartureGuide, 'savedAt'>): void {
  try {
    const next: RecentDepartureGuide = { ...entry, savedAt: Date.now() };
    const prev = loadRecentDepartureGuides().filter(
      (x) => !(x.flightId === next.flightId && x.date === next.date && x.mode === next.mode)
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify([next, ...prev].slice(0, MAX_ITEMS)));
  } catch {
    /* quota / private mode */
  }
}

export function formatRecentGuideLabel(g: RecentDepartureGuide): string {
  const date =
    g.date.length === 8 ? `${g.date.slice(4, 6)}.${g.date.slice(6, 8)}` : g.date;
  const bits = [g.flightId, date];
  if (g.terminal) bits.push(g.terminal);
  if (g.checkInCounter) bits.push(`체크인 ${g.checkInCounter}`);
  return bits.join(' · ');
}

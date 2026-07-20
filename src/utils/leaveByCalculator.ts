/** 집 → 공항 도착 시각 기준, 집에서 나설 시각 계산 */

/** 국제선 권장: 출발 3시간 전 공항 도착 */
export const DEFAULT_ARRIVE_BEFORE_MINUTES = 180;

/** "10:25" / "1025" → 분(0–1439) */
export function parseHmToMinutes(hm: string | null | undefined): number | null {
  if (!hm) return null;
  const digits = String(hm).replace(/\D/g, '');
  if (digits.length === 4) {
    const h = Number(digits.slice(0, 2));
    const m = Number(digits.slice(2, 4));
    if (h > 23 || m > 59) return null;
    return h * 60 + m;
  }
  const m = String(hm)
    .trim()
    .match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

export function formatMinutesAsHm(totalMinutes: number): string {
  const day = ((Math.floor(totalMinutes / 60) % 24) + 24) % 24;
  const min = ((totalMinutes % 60) + 60) % 60;
  return `${String(day).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

/** 출발시간 − 3시간 = 공항 도착 시각 */
export function resolveAirportArriveMinutes(args: {
  departureHm: string | null | undefined;
  minutesBefore?: number;
}): {
  arriveMinutes: number | null;
  departureHm: string | null;
  arriveHm: string | null;
  label: string;
  error?: string;
} {
  const departure = parseHmToMinutes(args.departureHm);
  if (departure == null) {
    return {
      arriveMinutes: null,
      departureHm: null,
      arriveHm: null,
      label: '공항 도착',
      error: '항공편 예정 출발 시각이 없습니다.',
    };
  }

  const before = args.minutesBefore ?? DEFAULT_ARRIVE_BEFORE_MINUTES;
  const arrive = departure - before;
  const departureHm = formatMinutesAsHm(departure);
  const arriveHm = formatMinutesAsHm(arrive);

  return {
    arriveMinutes: arrive,
    departureHm,
    arriveHm,
    label: `출발 ${departureHm} → 공항 도착 ${arriveHm} (3시간 전)`,
  };
}

export type LeaveByPlan = {
  leaveByHm: string;
  arriveHm: string;
  travelMinutes: number;
  airportMinutes: number;
  /** 이동+공항 안 */
  bufferMinutes: number;
  note: string;
};

/**
 * 집에서 나설 시각 = 공항 도착 − 집→공항 이동 − 공항 안 이동
 */
export function computeLeaveBy(args: {
  arriveMinutes: number;
  travelMinutes: number;
  airportMinutes: number;
}): LeaveByPlan | null {
  const travel = Math.max(0, Math.floor(args.travelMinutes));
  const airport = Math.max(0, Math.floor(args.airportMinutes));
  if (travel <= 0) return null;

  const buffer = travel + airport;
  const leave = args.arriveMinutes - buffer;

  return {
    leaveByHm: formatMinutesAsHm(leave),
    arriveHm: formatMinutesAsHm(args.arriveMinutes),
    travelMinutes: travel,
    airportMinutes: airport,
    bufferMinutes: buffer,
    note: `이동 ${travel}분 + 공항 안 약 ${airport}분`,
  };
}

export function clampTravelMinutes(raw: string | number): number {
  const n = typeof raw === 'number' ? raw : Number(String(raw).replace(/\D/g, ''));
  if (!Number.isFinite(n) || n <= 0) return 60;
  return Math.max(10, Math.min(300, Math.floor(n)));
}

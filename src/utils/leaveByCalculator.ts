/** 집 → 공항 도착 시각 기준, 집에서 나설 시각 계산 */

/** 국제선 권장: 출발 3시간 전 공항 도착 (= 주차대행 맡기는 시각 기본) */
export const DEFAULT_ARRIVE_BEFORE_MINUTES = 180;

/** 입국 후 차 찾기까지 여유 (출국심사·수하물·이동) */
export const DEFAULT_PICKUP_AFTER_ARRIVAL_MINUTES = 75;

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

function addDaysYmd(ymd: string, days: number): string {
  const d = new Date(`${ymd}T12:00:00`);
  if (Number.isNaN(d.getTime())) return ymd;
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export type ValetScheduleFromFlight = {
  /** 맡기기 / 찾기 시각 */
  hm: string;
  /** 맡기기 / 찾기 날짜 (자정 넘어가면 비행일과 다를 수 있음) */
  dateYmd: string;
  /** 정규화된 비행 시각 */
  flightHm: string;
};

/**
 * 출국편 출발 → 주차대행 맡기는 시각 (기본: 출발 3시간 전)
 * 새벽에 출발하면 전날로 넘어갈 수 있음
 */
export function resolveValetDropOffFromFlightDeparture(
  flightDepartureHm: string | null | undefined,
  flightDateYmd: string,
  minutesBefore: number = DEFAULT_ARRIVE_BEFORE_MINUTES
): ValetScheduleFromFlight | null {
  const flightMins = parseHmToMinutes(flightDepartureHm);
  if (flightMins == null || !/^\d{4}-\d{2}-\d{2}$/.test(flightDateYmd)) return null;

  let total = flightMins - Math.max(0, Math.floor(minutesBefore));
  let dateYmd = flightDateYmd;
  while (total < 0) {
    total += 24 * 60;
    dateYmd = addDaysYmd(dateYmd, -1);
  }

  return {
    hm: formatMinutesAsHm(total),
    dateYmd,
    flightHm: formatMinutesAsHm(flightMins),
  };
}

/**
 * 입국편 도착 → 주차대행 찾는 시각 (기본: 도착 + 75분)
 * 심야 도착이면 다음날로 넘어갈 수 있음
 */
export function resolveValetPickUpFromFlightArrival(
  flightArrivalHm: string | null | undefined,
  flightDateYmd: string,
  minutesAfter: number = DEFAULT_PICKUP_AFTER_ARRIVAL_MINUTES
): ValetScheduleFromFlight | null {
  const flightMins = parseHmToMinutes(flightArrivalHm);
  if (flightMins == null || !/^\d{4}-\d{2}-\d{2}$/.test(flightDateYmd)) return null;

  let total = flightMins + Math.max(0, Math.floor(minutesAfter));
  let dateYmd = flightDateYmd;
  while (total >= 24 * 60) {
    total -= 24 * 60;
    dateYmd = addDaysYmd(dateYmd, 1);
  }

  return {
    hm: formatMinutesAsHm(total),
    dateYmd,
    flightHm: formatMinutesAsHm(flightMins),
  };
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
  /** 이동 + 공항 이동 */
  bufferMinutes: number;
  note: string;
};

/**
 * 추천 출발 시각 = 공항 도착(출발−180) − 집→공항 − 공항 이동
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
    note: `집→공항 ${travel}분 + 공항 이동 ${airport}분`,
  };
}

export function clampTravelMinutes(raw: string | number): number {
  const n = typeof raw === 'number' ? raw : Number(String(raw).replace(/\D/g, ''));
  if (!Number.isFinite(n) || n <= 0) return 60;
  return Math.max(10, Math.min(300, Math.floor(n)));
}

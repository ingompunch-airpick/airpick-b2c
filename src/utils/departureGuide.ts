import { getOfficialParkingLot } from '../data/officialParkingLots';
import type { IcnFlightResponse } from '../lib/icnFlight';

export type TransportMode = 'car' | 'transit';
export type CarParkingType = 'long' | 'short' | 'valet';

/** 출국시간 계산기 주차 방식 (자가용 전제 · 대중교통 없음) */
export type LeaveTravelMode = 'long' | 'short' | 'valet';

export type DepartureStep = {
  text: string;
  /** 소요(분). 범위면 minutes~minutesMax */
  minutes?: number;
  minutesMax?: number;
};

export type DepartureGuidePlan = {
  steps: DepartureStep[];
  /** 표시된 이동 분 합 (없으면 null) */
  totalMinutesMin: number | null;
  totalMinutesMax: number | null;
  /** 합계 옆 짧은 설명 */
  totalNote: string;
};

/** 예전 저장값(limousine·subway·taxi 등) → 현재 모드 */
export function normalizeTransportMode(raw: unknown): TransportMode {
  if (raw === 'car') return 'car';
  if (raw === 'transit' || raw === 'subway' || raw === 'limousine' || raw === 'taxi') {
    return 'transit';
  }
  return 'car';
}

/**
 * 공항 내부 이동(분) — leave-by에 쓰는 고정값.
 * 장기: 주차10 + 정류장5 + 셔틀대기10 + 셔틀15 + 터미널8 = 48
 * 단기: 15
 * 주차대행: 0 (업체마다 인수 위치가 달라 고정값 미사용)
 * 체크인 대기·보안·출국심사·탑승구는 180분(3시간 전 도착)에 포함 · 여기 미반영
 */
export const AIRPORT_INTERNAL_MINUTES: Record<LeaveTravelMode, number> = {
  long: 48,
  short: 15,
  valet: 0,
};

export function airportInternalMinutes(mode: LeaveTravelMode): number {
  return AIRPORT_INTERNAL_MINUTES[mode];
}

/** 집→목적지 (길찾기 구간) */
export function leaveDriveLabel(mode: LeaveTravelMode): string {
  if (mode === 'long') return '집→장기주차장';
  if (mode === 'short') return '집→단기주차장';
  return '집→터미널';
}

/** 도착 후 공항 구간 */
export function leaveAirportSegmentLabel(mode: LeaveTravelMode): string {
  if (mode === 'long') return '장기주차장→공항';
  if (mode === 'short') return '단기주차장→공항';
  return '터미널→출국장';
}

/** @deprecated leaveAirportSegmentLabel */
export function airportMoveLabel(mode: LeaveTravelMode): string {
  return leaveAirportSegmentLabel(mode);
}

export function leaveTravelModeToDriveArgs(mode: LeaveTravelMode): {
  transport: TransportMode;
  parking: CarParkingType;
} {
  return { transport: 'car', parking: mode };
}

/** 성수기 안내만 — 계산식·결과는 변경하지 않음 */
export function showPeakTravelAdvisory(departureYmd: string): boolean {
  const ymd = departureYmd.replace(/\D/g, '');
  if (ymd.length !== 8) return false;
  const m = Number(ymd.slice(4, 6));
  const d = Number(ymd.slice(6, 8));
  if (m === 7 || m === 8) return true;
  if (m === 12 && d >= 20) return true;
  if (m === 1 && d <= 10) return true;
  if (m === 5 && d <= 5) return true;
  if (m === 9 && d >= 20) return true;
  return false;
}

/** 자리 찾기·셔틀 — 내부 단계용 (leave-by 합계는 AIRPORT_INTERNAL_MINUTES) */
const PARK_FIND = { minutes: 10, minutesMax: 10 } as const;
const SHUTTLE_WAIT = { minutes: 10, minutesMax: 10 } as const;
const SHUTTLE_RIDE = { minutes: 15, minutesMax: 15 } as const;

const WALK = {
  toShuttleStop: { minutes: 5, minutesMax: 5 },
  toDepartureHall: { minutes: 8, minutesMax: 8 },
  shortToHall: { minutes: 5, minutesMax: 5 },
  dropoffToCheckIn: { minutes: 5, minutesMax: 10 },
} as const;

function sumRanges(steps: DepartureStep[]): {
  totalMinutesMin: number | null;
  totalMinutesMax: number | null;
} {
  const timed = steps.filter((s) => s.minutes != null && s.minutes > 0);
  if (timed.length === 0) return { totalMinutesMin: null, totalMinutesMax: null };
  const totalMinutesMin = timed.reduce((a, s) => a + (s.minutes ?? 0), 0);
  const totalMinutesMax = timed.reduce(
    (a, s) => a + (s.minutesMax ?? s.minutes ?? 0),
    0
  );
  return { totalMinutesMin, totalMinutesMax };
}

export function formatStepMinutes(step: Pick<DepartureStep, 'minutes' | 'minutesMax'>): string | null {
  if (step.minutes == null || step.minutes <= 0) return null;
  if (step.minutesMax != null && step.minutesMax > step.minutes) {
    return `약 ${step.minutes}~${step.minutesMax}분`;
  }
  return `약 ${step.minutes}분`;
}

export function formatTotalMinutes(min: number | null, max: number | null): string | null {
  if (min == null) return null;
  if (max != null && max > min) return `약 ${min}~${max}분`;
  return `약 ${min}분`;
}

function longTermShuttlePlan(terminal: 'T1' | 'T2'): DepartureStep[] {
  const lot = getOfficialParkingLot(terminal, 'long');
  const arriveAndPark: DepartureStep[] = [
    {
      text: `내비에 「${lot.navQuery}」 또는 「${lot.address}」로 이동해 ${lot.name}에 도착하세요.`,
    },
    {
      text: '주차장에서 빈자리를 찾아 주차하세요.',
      ...PARK_FIND,
    },
    {
      text: '주차 위치에서 가장 가까운 무료 셔틀(장기 탑승장)으로 가세요.',
      ...WALK.toShuttleStop,
    },
    {
      text: '셔틀을 기다리세요.',
      ...SHUTTLE_WAIT,
    },
  ];

  if (terminal === 'T2') {
    return [
      ...arriveAndPark,
      {
        text: '공항02 셔틀을 타고 제2여객터미널 1층 중앙(5~6번 출입구 부근)에서 내리세요. T2 터미널 하차는 이곳 한 곳입니다.',
        ...SHUTTLE_RIDE,
      },
      {
        text: '건물로 들어간 뒤 3층 출국장으로 올라가세요.',
        ...WALK.toDepartureHall,
      },
    ];
  }
  return [
    ...arriveAndPark,
    {
      text: '셔틀(공항01)은 1층 3C(동측) 또는 13C(서측) 중 한 곳에 정차합니다. 두 곳 모두 제1여객터미널이고, 어디든 내려도 됩니다.',
      ...SHUTTLE_RIDE,
    },
    {
      text: '정차하면 내려 건물로 들어간 뒤 3층 출국장으로 올라가세요.',
      ...WALK.toDepartureHall,
    },
  ];
}

export function buildDepartureGuide(
  flight: IcnFlightResponse,
  mode: TransportMode,
  parking?: CarParkingType
): DepartureGuidePlan {
  const terminal = flight.terminal ?? 'T1';
  const terminalName =
    flight.terminalLabel ?? (terminal === 'T2' ? '제2여객터미널' : '제1여객터미널');
  const counter = flight.checkInCounter
    ? `체크인 카운터 ${flight.checkInCounter}`
    : '체크인 카운터(공항·항공사 안내 확인)';
  const airlineHint = flight.airline ? `(${flight.airline})` : '';
  const checkInStep: DepartureStep = {
    text: `${counter}${airlineHint ? ` ${airlineHint}` : ''}로 가세요.`,
  };

  let steps: DepartureStep[];
  let totalNote: string;

  if (mode === 'car') {
    const park = parking ?? 'long';
    if (park === 'long') {
      steps = [...longTermShuttlePlan(terminal), checkInStep];
      totalNote = '장기주차장→출국장 · 약 48분';
    } else if (park === 'short') {
      const lot = getOfficialParkingLot(terminal, 'short');
      steps = [
        {
          text: `내비에 「${lot.navQuery}」 또는 「${lot.address}」로 이동해 ${lot.name}에 도착하세요.`,
        },
        {
          text: '주차장에서 빈자리를 찾아 주차하세요.',
          minutes: 10,
          minutesMax: 10,
        },
        {
          text: `안내 동선을 따라 ${terminalName} 3층 출국장으로 이동하세요.`,
          minutes: 5,
          minutesMax: 5,
        },
        checkInStep,
      ];
      totalNote = '단기주차→출국장 · 약 15분';
    } else {
      // 주차대행: 업체별 인수 위치가 달라 시간 합산에 넣지 않음
      steps = [
        {
          text: '주차대행은 업체마다 차량 인수 위치·운영 방식이 다릅니다. 상세에서 이용 방법을 확인해 주세요.',
        },
        checkInStep,
      ];
      totalNote = '주차대행 · 공항 이동시간 미포함(업체별 상이)';
    }
  } else {
    const stationHint =
      terminal === 'T2'
        ? '공항철도·버스 하차 후 인천공항2터미널'
        : '공항철도·버스 하차 후 인천공항1터미널';
    steps = [
      { text: `${stationHint}로 도착하세요.` },
      {
        text: '안내를 따라 출국장(3층)으로 이동하세요.',
        ...WALK.dropoffToCheckIn,
      },
      checkInStep,
    ];
    totalNote = '하차→출국장 도보';
  }

  const { totalMinutesMin, totalMinutesMax } = sumRanges(steps);
  return { steps, totalMinutesMin, totalMinutesMax, totalNote };
}

/** @deprecated use buildDepartureGuide */
export function buildDepartureSteps(
  flight: IcnFlightResponse,
  mode: TransportMode,
  parking?: CarParkingType
): string[] {
  return buildDepartureGuide(flight, mode, parking).steps.map((s) => {
    const t = formatStepMinutes(s);
    return t ? `${s.text} (${t})` : s.text;
  });
}

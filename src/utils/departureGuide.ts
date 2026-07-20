import { getOfficialParkingLot } from '../data/officialParkingLots';
import type { IcnFlightResponse } from '../lib/icnFlight';

export type TransportMode = 'car' | 'limousine' | 'subway';
export type CarParkingType = 'long' | 'short' | 'valet';

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

/** 예전 저장값(taxi 등) → 현재 모드 */
export function normalizeTransportMode(raw: unknown): TransportMode {
  if (raw === 'car' || raw === 'limousine' || raw === 'subway') return raw;
  if (raw === 'taxi') return 'limousine';
  return 'car';
}

/** 자리 찾기·셔틀 대기 — 고정 여유 */
const PARK_FIND = { minutes: 10, minutesMax: 10 } as const;
const SHUTTLE_WAIT = { minutes: 15, minutesMax: 15 } as const;

/** 공개 안내 기준 — 셔틀 탑승 후 이동 */
const SHUTTLE_RIDE = {
  T1: { min: 7, max: 15 },
  T2: { min: 15, max: 15 },
} as const;

const WALK = {
  /** 주차 후 가까운 셔틀 탑승장까지 */
  toShuttleStop: { minutes: 5, minutesMax: 5 },
  /** 터미널 하차 → 3층 출국장 */
  toDepartureHall: { minutes: 5, minutesMax: 8 },
  /** 단기주차 → 출국장 */
  shortToHall: { minutes: 5, minutesMax: 10 },
  /** 리무진·지하철 하차 → 출국장·체크인 */
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
  const ride = SHUTTLE_RIDE[terminal];
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
      text: '셔틀을 기다리세요. (배차 간격 여유)',
      ...SHUTTLE_WAIT,
    },
  ];

  if (terminal === 'T2') {
    return [
      ...arriveAndPark,
      {
        text: '공항02 셔틀을 타고 제2여객터미널 1층 중앙(5~6번 출입구 부근)에서 내리세요. T2 터미널 하차는 이곳 한 곳입니다.',
        minutes: ride.min,
        minutesMax: ride.max,
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
      minutes: ride.min,
      minutesMax: ride.max,
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
  let totalNote = '도보·셔틀·자리 찾기·셔틀 대기 포함(체크인 대기 제외)';

  if (mode === 'car') {
    const park = parking ?? 'long';
    if (park === 'long') {
      steps = [...longTermShuttlePlan(terminal), checkInStep];
      totalNote =
        '자리 찾기 10분 + 탑승장 5분 + 셔틀 대기 15분 + 탑승·도보 · 체크인 대기 제외';
    } else if (park === 'short') {
      const lot = getOfficialParkingLot(terminal, 'short');
      steps = [
        {
          text: `내비에 「${lot.navQuery}」 또는 「${lot.address}」로 이동해 ${lot.name}에 도착하세요.`,
        },
        {
          text: '주차장에서 빈자리를 찾아 주차하세요.',
          ...PARK_FIND,
        },
        {
          text: `안내 동선을 따라 ${terminalName} 3층 출국장으로 이동하세요.`,
          ...WALK.shortToHall,
        },
        checkInStep,
      ];
      totalNote = '자리 찾기 10분 + 도보 포함 · 체크인 대기는 제외';
    } else {
      steps = [
        { text: '예약한 주차대행 픽업 장소에서 차량을 맡기세요.' },
        {
          text: `안내받은 동선으로 ${terminalName}에 도착하세요.`,
        },
        {
          text: `${terminalName} 3층 출국장으로 가세요.`,
          ...WALK.dropoffToCheckIn,
        },
        checkInStep,
      ];
      totalNote = '터미널 도착 후 도보만 · 픽업·이동 시간은 업체마다 다름';
    }
  } else if (mode === 'limousine') {
    steps = [
      { text: `리무진에서 ${terminalName}에 내리세요.` },
      {
        text: '터미널 안으로 들어와 3층 출국장으로 이동하세요.',
        ...WALK.dropoffToCheckIn,
      },
      checkInStep,
    ];
    totalNote = '하차 후 도보만 · 리무진 탑승 시간은 제외';
  } else {
    const station =
      terminal === 'T2' ? '공항철도 인천공항2터미널역' : '공항철도 인천공항1터미널역';
    steps = [
      { text: `${station}에서 내리세요.` },
      {
        text: '안내를 따라 출국장(3층)으로 이동하세요.',
        ...WALK.dropoffToCheckIn,
      },
      checkInStep,
    ];
    totalNote = '하차 후 도보만 · 열차 탑승 시간은 제외';
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

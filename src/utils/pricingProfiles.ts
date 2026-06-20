import type { Company } from '../types';
import { todayYmd } from './dates';

export const ACTUAL_PRICING_RULES: Record<
  string,
  {
    baseDays1T: number;
    basePrice1T: number;
    extraPricePerDay1T: number;
    baseDays2T: number;
    basePrice2T: number;
    extraPricePerDay2T: number;
    extraFee2T: number;
  }
> = {
  'airport-pricing': {
    baseDays1T: 3,
    basePrice1T: 60000,
    extraPricePerDay1T: 10000,
    baseDays2T: 4,
    basePrice2T: 80000,
    extraPricePerDay2T: 10000,
    extraFee2T: 0,
  },
  'gate-indoor-pricing': {
    baseDays1T: 4,
    basePrice1T: 50000,
    extraPricePerDay1T: 10000,
    baseDays2T: 4,
    basePrice2T: 50000,
    extraPricePerDay2T: 10000,
    extraFee2T: 10000,
  },
  'gate-outdoor-pricing': {
    baseDays1T: 3,
    basePrice1T: 40000,
    extraPricePerDay1T: 5000,
    baseDays2T: 3,
    basePrice2T: 40000,
    extraPricePerDay2T: 5000,
    extraFee2T: 10000,
  },
  'mampyeonhan-pricing': {
    baseDays1T: 4,
    basePrice1T: 40000,
    extraPricePerDay1T: 5000,
    baseDays2T: 4,
    basePrice2T: 40000,
    extraPricePerDay2T: 5000,
    extraFee2T: 10000,
  },
  'plain-pricing': {
    baseDays1T: 3,
    basePrice1T: 35000,
    extraPricePerDay1T: 5000,
    baseDays2T: 3,
    basePrice2T: 35000,
    extraPricePerDay2T: 5000,
    extraFee2T: 0,
  },
  'danyeowa-pricing': {
    baseDays1T: 4,
    basePrice1T: 40000,
    extraPricePerDay1T: 5000,
    baseDays2T: 4,
    basePrice2T: 45000,
    extraPricePerDay2T: 5000,
    extraFee2T: 0,
  },
  'honest-outdoor-pricing': {
    baseDays1T: 3,
    basePrice1T: 40000,
    extraPricePerDay1T: 5000,
    baseDays2T: 3,
    basePrice2T: 40000,
    extraPricePerDay2T: 5000,
    extraFee2T: 20000,
  },
  'honest-indoor-pricing': {
    baseDays1T: 4,
    basePrice1T: 60000,
    extraPricePerDay1T: 10000,
    baseDays2T: 4,
    basePrice2T: 60000,
    extraPricePerDay2T: 10000,
    extraFee2T: 20000,
  },
  'parkingone-indoor-pricing': {
    baseDays1T: 4,
    basePrice1T: 60000,
    extraPricePerDay1T: 10000,
    baseDays2T: 4,
    basePrice2T: 80000,
    extraPricePerDay2T: 10000,
    extraFee2T: 20000,
  },
  /** 베이스캠프 — 1~4일 고정, 5일째부터 일할증 · 심야할증 없음 */
  'basecamp-outdoor-pricing': {
    baseDays1T: 4,
    basePrice1T: 50000,
    extraPricePerDay1T: 5000,
    baseDays2T: 4,
    basePrice2T: 60000,
    extraPricePerDay2T: 5000,
    extraFee2T: 0,
  },
  'basecamp-indoor-pricing': {
    baseDays1T: 4,
    basePrice1T: 60000,
    extraPricePerDay1T: 10000,
    baseDays2T: 4,
    basePrice2T: 70000,
    extraPricePerDay2T: 10000,
    extraFee2T: 0,
  },
  /** 세븐주차 — 실내 · 1~4일 고정, 5일째 +1만/일 · T2 금액에 주차대행료 1만 포함 */
  'seven-indoor-pricing': {
    baseDays1T: 4,
    basePrice1T: 60000,
    extraPricePerDay1T: 10000,
    baseDays2T: 4,
    basePrice2T: 70000,
    extraPricePerDay2T: 10000,
    extraFee2T: 0,
  },
  /** 쿠파킹 — 실내 · T1: 1~4일 6만 / T2: 1~3일 6만·4일째 +1만/일 */
  'cou-indoor-pricing': {
    baseDays1T: 4,
    basePrice1T: 60000,
    extraPricePerDay1T: 10000,
    baseDays2T: 3,
    basePrice2T: 60000,
    extraPricePerDay2T: 10000,
    extraFee2T: 0,
  },
  /** 넘버원 — T1 야외 4일 5만/+5천 · 실내 4일 6만/+1만 · T2 +1.5만 */
  'numberone-outdoor-pricing': {
    baseDays1T: 4,
    basePrice1T: 50000,
    extraPricePerDay1T: 5000,
    baseDays2T: 4,
    basePrice2T: 65000,
    extraPricePerDay2T: 5000,
    extraFee2T: 0,
  },
  'numberone-indoor-pricing': {
    baseDays1T: 4,
    basePrice1T: 60000,
    extraPricePerDay1T: 10000,
    baseDays2T: 4,
    basePrice2T: 75000,
    extraPricePerDay2T: 10000,
    extraFee2T: 0,
  },
  /** 명품 — T1 기본 · T2 +2만 (2T 터미널) */
  'myeongpum-outdoor-pricing': {
    baseDays1T: 4,
    basePrice1T: 50000,
    extraPricePerDay1T: 5000,
    baseDays2T: 4,
    basePrice2T: 50000,
    extraPricePerDay2T: 5000,
    extraFee2T: 20000,
  },
  'myeongpum-indoor-pricing': {
    baseDays1T: 4,
    basePrice1T: 60000,
    extraPricePerDay1T: 10000,
    baseDays2T: 4,
    basePrice2T: 60000,
    extraPricePerDay2T: 10000,
    extraFee2T: 20000,
  },
  /** 에어25시 — T1/T2 기본 동일 · T2 이용 +1만 */
  'air25-indoor-pricing': {
    baseDays1T: 4,
    basePrice1T: 60000,
    extraPricePerDay1T: 10000,
    baseDays2T: 4,
    basePrice2T: 60000,
    extraPricePerDay2T: 10000,
    extraFee2T: 10000,
  },
  'air25-outdoor-pricing': {
    baseDays1T: 4,
    basePrice1T: 50000,
    extraPricePerDay1T: 5000,
    baseDays2T: 4,
    basePrice2T: 50000,
    extraPricePerDay2T: 5000,
    extraFee2T: 10000,
  },
  /** 청호 실내 — T1 기준 · T2 입출 각 +1만 */
  'chungho-indoor-pricing': {
    baseDays1T: 4,
    basePrice1T: 60000,
    extraPricePerDay1T: 10000,
    baseDays2T: 4,
    basePrice2T: 60000,
    extraPricePerDay2T: 10000,
    extraFee2T: 20000,
  },
  /** 로얄파킹 실내 — 1~4일 6만 · 5일째 +1만 · T2 입출 각 +1만 */
  'royal-indoor-pricing': {
    baseDays1T: 4,
    basePrice1T: 60000,
    extraPricePerDay1T: 10000,
    baseDays2T: 4,
    basePrice2T: 60000,
    extraPricePerDay2T: 10000,
    extraFee2T: 20000,
  },
  /** 큐브 — T1 4일 4.5만 · T2 4일 5만 · 5일째 +5천/일 */
  'cube-valet-pricing': {
    baseDays1T: 4,
    basePrice1T: 45000,
    extraPricePerDay1T: 5000,
    baseDays2T: 4,
    basePrice2T: 50000,
    extraPricePerDay2T: 5000,
    extraFee2T: 0,
  },
  /** 블루파킹 실내 — T1 4일 6만 · T2 4일 7만 · 5일째 +1만/일 */
  'blue-indoor-pricing': {
    baseDays1T: 4,
    basePrice1T: 60000,
    extraPricePerDay1T: 10000,
    baseDays2T: 4,
    basePrice2T: 70000,
    extraPricePerDay2T: 10000,
    extraFee2T: 0,
  },
  /** 미래주차 실내 — T1 4일 6만 · T2 4일 8만 · 5일째 +1만/일 */
  'mirae-indoor-pricing': {
    baseDays1T: 4,
    basePrice1T: 60000,
    extraPricePerDay1T: 10000,
    baseDays2T: 4,
    basePrice2T: 80000,
    extraPricePerDay2T: 10000,
    extraFee2T: 0,
  },
  /** 플러스 — T1/T2 동일 · 야외 4일 4만 · 실내 4일 5만 · 5일째 +1만/일 */
  'plus-outdoor-pricing': {
    baseDays1T: 4,
    basePrice1T: 40000,
    extraPricePerDay1T: 10000,
    baseDays2T: 4,
    basePrice2T: 40000,
    extraPricePerDay2T: 10000,
    extraFee2T: 0,
  },
  'plus-indoor-pricing': {
    baseDays1T: 4,
    basePrice1T: 50000,
    extraPricePerDay1T: 10000,
    baseDays2T: 4,
    basePrice2T: 50000,
    extraPricePerDay2T: 10000,
    extraFee2T: 0,
  },
  /** 차차 실내 — 1~4일 6만 · 5일째 +1만/일 · T1/T2 동일 */
  'chacha-indoor-pricing': {
    baseDays1T: 4,
    basePrice1T: 60000,
    extraPricePerDay1T: 10000,
    baseDays2T: 4,
    basePrice2T: 60000,
    extraPricePerDay2T: 10000,
    extraFee2T: 0,
  },
};

export type PricingTerminal = '1T' | '2T';

export interface NightSurchargeTier {
  startTime: string;
  endTime: string;
  fee1T: number;
  fee2T?: number;
}

export type NightSurchargeMode = 'per_trip' | 'once_max_tier';

export interface NightSurchargeConfig {
  /** per_trip: 입·출차 각각 / once_max_tier: 구간 중 최고가 1회만 (맘편한) */
  mode: NightSurchargeMode;
  departureTiers: NightSurchargeTier[];
  /** 미설정 시 departureTiers 와 동일 */
  arrivalTiers?: NightSurchargeTier[];
}

/**
 * 프로필별 야간·심야 할증 (요금표·홈페이지 기준)
 * - 겹치는 구간: 해당 trip에서 더 높은 금액
 * - once_max_tier: 입·출 중 한 번만 최고 tier 적용
 */
export const PROFILE_NIGHT_SURCHARGE_CONFIG: Record<string, NightSurchargeConfig> = {
  'airport-pricing': {
    mode: 'per_trip',
    departureTiers: [{ startTime: '19:00', endTime: '05:00', fee1T: 10000 }],
  },
  'gate-indoor-pricing': {
    mode: 'per_trip',
    departureTiers: [{ startTime: '19:00', endTime: '05:00', fee1T: 15000 }],
  },
  'gate-outdoor-pricing': {
    mode: 'per_trip',
    departureTiers: [{ startTime: '19:00', endTime: '05:00', fee1T: 10000 }],
  },
  'mampyeonhan-pricing': {
    mode: 'once_max_tier',
    departureTiers: [
      { startTime: '19:00', endTime: '22:00', fee1T: 10000 },
      { startTime: '22:30', endTime: '05:00', fee1T: 15000 },
    ],
  },
  'plain-pricing': {
    mode: 'per_trip',
    departureTiers: [{ startTime: '19:00', endTime: '05:00', fee1T: 10000 }],
  },
  'danyeowa-pricing': {
    mode: 'per_trip',
    departureTiers: [{ startTime: '19:00', endTime: '05:00', fee1T: 10000 }],
  },
  'atelier-outdoor-pricing': {
    mode: 'per_trip',
    departureTiers: [{ startTime: '19:00', endTime: '05:00', fee1T: 10000 }],
  },
  'honest-outdoor-pricing': {
    mode: 'per_trip',
    departureTiers: [{ startTime: '19:00', endTime: '05:00', fee1T: 15000 }],
  },
  'honest-indoor-pricing': {
    mode: 'per_trip',
    departureTiers: [{ startTime: '19:00', endTime: '05:00', fee1T: 15000 }],
  },
  'onair-indoor-pricing': {
    mode: 'per_trip',
    departureTiers: [{ startTime: '18:00', endTime: '05:00', fee1T: 15000, fee2T: 20000 }],
  },
  'parkingone-indoor-pricing': {
    mode: 'per_trip',
    departureTiers: [
      { startTime: '18:00', endTime: '05:00', fee1T: 15000, fee2T: 20000 },
      { startTime: '23:00', endTime: '04:00', fee1T: 20000, fee2T: 20000 },
    ],
  },
  'seven-indoor-pricing': {
    mode: 'per_trip',
    departureTiers: [{ startTime: '19:00', endTime: '05:00', fee1T: 15000 }],
    arrivalTiers: [{ startTime: '18:00', endTime: '05:00', fee1T: 15000 }],
  },
  'fly-outdoor-pricing': {
    mode: 'per_trip',
    departureTiers: [
      { startTime: '03:00', endTime: '04:59', fee1T: 10000 },
      { startTime: '19:00', endTime: '21:59', fee1T: 10000 },
      { startTime: '22:00', endTime: '02:59', fee1T: 15000 },
    ],
  },
  'numberone-outdoor-pricing': {
    mode: 'per_trip',
    departureTiers: [{ startTime: '19:00', endTime: '05:00', fee1T: 15000 }],
  },
  'numberone-indoor-pricing': {
    mode: 'per_trip',
    departureTiers: [{ startTime: '19:00', endTime: '05:00', fee1T: 15000 }],
  },
  'hyundai-outdoor-pricing': {
    mode: 'per_trip',
    departureTiers: [{ startTime: '18:30', endTime: '05:00', fee1T: 15000 }],
  },
  'hyundai-indoor-pricing': {
    mode: 'per_trip',
    departureTiers: [{ startTime: '18:30', endTime: '05:00', fee1T: 15000 }],
  },
  'myeongpum-outdoor-pricing': {
    mode: 'per_trip',
    departureTiers: [{ startTime: '18:00', endTime: '05:00', fee1T: 15000 }],
  },
  'myeongpum-indoor-pricing': {
    mode: 'per_trip',
    departureTiers: [{ startTime: '18:00', endTime: '05:00', fee1T: 15000 }],
  },
  'air25-indoor-pricing': {
    mode: 'per_trip',
    departureTiers: [{ startTime: '19:00', endTime: '05:00', fee1T: 15000 }],
  },
  'air25-outdoor-pricing': {
    mode: 'per_trip',
    departureTiers: [{ startTime: '19:00', endTime: '05:00', fee1T: 15000 }],
  },
  'chungho-indoor-pricing': {
    mode: 'per_trip',
    departureTiers: [{ startTime: '19:00', endTime: '05:00', fee1T: 15000 }],
  },
  'chungho-outdoor-pricing': {
    mode: 'per_trip',
    departureTiers: [{ startTime: '19:00', endTime: '05:00', fee1T: 15000 }],
  },
  'royal-outdoor-pricing': {
    mode: 'per_trip',
    departureTiers: [{ startTime: '18:00', endTime: '05:00', fee1T: 10000 }],
  },
  'royal-indoor-pricing': {
    mode: 'per_trip',
    departureTiers: [{ startTime: '18:00', endTime: '05:00', fee1T: 10000 }],
  },
  'onmaeum-outdoor-pricing': {
    mode: 'per_trip',
    departureTiers: [{ startTime: '19:00', endTime: '05:30', fee1T: 10000 }],
    arrivalTiers: [{ startTime: '19:00', endTime: '05:30', fee1T: 10000 }],
  },
  'cube-valet-pricing': {
    mode: 'per_trip',
    departureTiers: [{ startTime: '19:00', endTime: '05:00', fee1T: 15000 }],
  },
  'blue-indoor-pricing': {
    mode: 'per_trip',
    departureTiers: [{ startTime: '18:00', endTime: '05:00', fee1T: 15000, fee2T: 20000 }],
  },
  'mirae-indoor-pricing': {
    mode: 'per_trip',
    departureTiers: [{ startTime: '19:00', endTime: '05:00', fee1T: 15000 }],
  },
  'plus-outdoor-pricing': {
    mode: 'per_trip',
    departureTiers: [{ startTime: '19:00', endTime: '05:00', fee1T: 15000 }],
  },
  'plus-indoor-pricing': {
    mode: 'per_trip',
    departureTiers: [{ startTime: '19:00', endTime: '05:00', fee1T: 15000 }],
  },
  'chacha-indoor-pricing': {
    mode: 'per_trip',
    departureTiers: [{ startTime: '19:00', endTime: '05:00', fee1T: 10000 }],
    arrivalTiers: [{ startTime: '18:40', endTime: '05:00', fee1T: 10000 }],
  },
  'chacha-outdoor-pricing': {
    mode: 'per_trip',
    departureTiers: [{ startTime: '19:00', endTime: '05:00', fee1T: 10000 }],
    arrivalTiers: [{ startTime: '18:40', endTime: '05:00', fee1T: 10000 }],
  },
};

/** 입차일이 오늘이면 추가 (현대주차 당일 접수 +1만) */
export const PROFILE_SAME_DAY_BOOKING_FEE: Record<string, number> = {
  'hyundai-outdoor-pricing': 10000,
  'hyundai-indoor-pricing': 10000,
};

/** 입차월 12·1·2월 추가 (큐브 겨울철 +5천) */
export const PROFILE_WINTER_DEPARTURE_FEE: Record<string, number> = {
  'cube-valet-pricing': 5000,
};

export interface RealParkingPriceOptions {
  departureDate?: string;
  arrivalDate?: string;
  departureTime?: string;
  arrivalTime?: string;
  checkNightSurcharge?: (dateTime: string, start: string, end: string) => boolean;
}

function nightFeeForDateTime(
  dateTime: string,
  terminal: PricingTerminal,
  tiers: NightSurchargeTier[],
  check: (dateTime: string, start: string, end: string) => boolean
): number {
  let max = 0;
  for (const tier of tiers) {
    if (check(dateTime, tier.startTime, tier.endTime)) {
      const fee = terminal === '2T' ? (tier.fee2T ?? tier.fee1T) : tier.fee1T;
      max = Math.max(max, fee);
    }
  }
  return max;
}

function maxTierFeeAcrossDateTimes(
  dateTimes: string[],
  terminal: PricingTerminal,
  tiers: NightSurchargeTier[],
  check: (dateTime: string, start: string, end: string) => boolean
): number {
  let max = 0;
  for (const dateTime of dateTimes) {
    max = Math.max(max, nightFeeForDateTime(dateTime, terminal, tiers, check));
  }
  return max;
}

function addProfileNightSurcharges(
  profileId: string,
  terminal: PricingTerminal,
  total: number,
  options?: RealParkingPriceOptions
): number {
  const config = PROFILE_NIGHT_SURCHARGE_CONFIG[profileId];
  const check = options?.checkNightSurcharge;
  if (!config || !check || !options?.departureDate) return total;

  const depTime = options.departureTime || '10:00';
  const arrTime = options.arrivalTime || '10:00';
  const depDateTime = `${options.departureDate} ${depTime}`;
  const arrDateTime = options.arrivalDate ? `${options.arrivalDate} ${arrTime}` : '';

  if (config.mode === 'once_max_tier') {
    const dateTimes = arrDateTime ? [depDateTime, arrDateTime] : [depDateTime];
    return total + maxTierFeeAcrossDateTimes(dateTimes, terminal, config.departureTiers, check);
  }

  const arrivalTiers = config.arrivalTiers ?? config.departureTiers;
  let extra = nightFeeForDateTime(depDateTime, terminal, config.departureTiers, check);
  if (arrDateTime) {
    extra += nightFeeForDateTime(arrDateTime, terminal, arrivalTiers, check);
  }
  return total + extra;
}

function addSameDayBookingFee(
  profileId: string,
  total: number,
  options?: RealParkingPriceOptions
): number {
  const fee = PROFILE_SAME_DAY_BOOKING_FEE[profileId];
  if (!fee || !options?.departureDate) return total;
  if (options.departureDate === todayYmd()) return total + fee;
  return total;
}

function addWinterDepartureFee(
  profileId: string,
  total: number,
  options?: RealParkingPriceOptions
): number {
  const fee = PROFILE_WINTER_DEPARTURE_FEE[profileId];
  if (!fee || !options?.departureDate) return total;
  const month = Number(options.departureDate.split('-')[1]);
  if (month === 12 || month === 1 || month === 2) return total + fee;
  return total;
}

/** 가유(GY) 입점 — 1T: 3일 40,000 + 4일째 5,000/일 · 2T: 4일 50,000, 5일 60,000 + 6일째 5,000/일 */
export function calculateGayuBasePrice(totalDays: number, terminal: PricingTerminal): number {
  if (totalDays <= 0) return 0;

  if (terminal === '2T') {
    if (totalDays <= 4) return 50000;
    return 60000 + (totalDays - 5) * 5000;
  }

  if (totalDays <= 3) return 40000;
  return 40000 + (totalDays - 3) * 5000;
}

export interface GayuParkingPriceInput {
  totalDays: number;
  terminal: PricingTerminal;
  isCard?: boolean;
  departureDate?: string;
  arrivalDate?: string;
  departureTime?: string;
  arrivalTime?: string;
  /** 입·출차 심야(19:00~05:00) 각 10,000원 */
  checkNightSurcharge?: (dateTime: string, start: string, end: string) => boolean;
}

export function calculateGayuParkingPrice(input: GayuParkingPriceInput): number {
  const {
    totalDays,
    terminal,
    isCard = false,
    departureDate,
    arrivalDate,
    departureTime = '10:00',
    arrivalTime = '10:00',
    checkNightSurcharge,
  } = input;

  let total = calculateGayuBasePrice(totalDays, terminal);

  if (checkNightSurcharge && departureDate) {
    const nightStart = '19:00';
    const nightEnd = '05:00';
    const nightFee = 10000;
    if (checkNightSurcharge(`${departureDate} ${departureTime}`, nightStart, nightEnd)) {
      total += nightFee;
    }
    if (arrivalDate && checkNightSurcharge(`${arrivalDate} ${arrivalTime}`, nightStart, nightEnd)) {
      total += nightFee;
    }
  }

  if (isCard) {
    total = Math.floor(total * 1.1);
  }

  return total;
}

/** 아뜰리엔 야외 — 1~4일 40,000 · 5일 50,000 · 6일째 +5,000/일 */
export function calculateAtelierOutdoorBasePrice(totalDays: number): number {
  if (totalDays <= 0) return 0;
  if (totalDays <= 4) return 40000;
  return 50000 + (totalDays - 5) * 5000;
}

/** 온에어 실내 — 1~3일 45,000 · 4일 60,000 · 5일째 +10,000/일 (T1/T2 동일) */
export function calculateOnairIndoorBasePrice(totalDays: number): number {
  if (totalDays <= 0) return 0;
  if (totalDays <= 3) return 45000;
  if (totalDays === 4) return 60000;
  return 60000 + (totalDays - 4) * 10000;
}

/** 현대주차 야외 — 1~2일 3만 · 3일 4.5만 · 4일째 +5,000/일 */
export function calculateHyundaiOutdoorBasePrice(totalDays: number): number {
  if (totalDays <= 0) return 0;
  if (totalDays <= 2) return 30000;
  if (totalDays === 3) return 45000;
  return 50000 + (totalDays - 4) * 5000;
}

/** 현대주차 실내 — 1~2일 5만 · 3일 6만 · 4일째 +10,000/일 */
export function calculateHyundaiIndoorBasePrice(totalDays: number): number {
  if (totalDays <= 0) return 0;
  if (totalDays <= 2) return 50000;
  if (totalDays === 3) return 60000;
  return 70000 + (totalDays - 4) * 10000;
}

/** 청호 야외 — 1~4일 5만 · 5일 6만 · 6일째 +5,000/일 */
export function calculateChunghoOutdoorBasePrice(totalDays: number): number {
  if (totalDays <= 0) return 0;
  if (totalDays <= 4) return 50000;
  if (totalDays === 5) return 60000;
  return 60000 + (totalDays - 5) * 5000;
}

/** 로얄파킹 야외 — 1~3일 4만 · 4일째 +5,000/일 */
export function calculateRoyalOutdoorBasePrice(totalDays: number): number {
  if (totalDays <= 0) return 0;
  if (totalDays <= 3) return 40000;
  return 40000 + (totalDays - 3) * 5000;
}

/** 온마음 야외 — 1~3일 3.5만 · 4일 4만 · 5일째 +5,000/일 · T1/T2 동일 */
export function calculateOnmaeumOutdoorBasePrice(totalDays: number): number {
  if (totalDays <= 0) return 0;
  if (totalDays <= 3) return 35000;
  if (totalDays === 4) return 40000;
  return 40000 + (totalDays - 4) * 5000;
}

/** 차차 야외 — 1~4일 4만 · 5일 5만 · 6일째 +5,000/일 */
export function calculateChachaOutdoorBasePrice(totalDays: number): number {
  if (totalDays <= 0) return 0;
  if (totalDays <= 4) return 40000;
  if (totalDays === 5) return 50000;
  return 50000 + (totalDays - 5) * 5000;
}

export function calculateRealParkingPrice(
  profileId: string,
  totalDays: number,
  terminal: PricingTerminal = '1T',
  isCard = false,
  options?: RealParkingPriceOptions
): number {
  if (totalDays <= 0) return 0;

  let totalPrice = 0;
  let additionalFee = 0;

  if (profileId === 'atelier-outdoor-pricing') {
    totalPrice = calculateAtelierOutdoorBasePrice(totalDays);
  } else if (profileId === 'fly-outdoor-pricing') {
    totalPrice = calculateAtelierOutdoorBasePrice(totalDays);
    if (terminal === '2T') additionalFee = 20000;
  } else if (profileId === 'onair-indoor-pricing') {
    totalPrice = calculateOnairIndoorBasePrice(totalDays);
    if (terminal === '2T') additionalFee = 20000;
  } else if (profileId === 'hyundai-outdoor-pricing') {
    totalPrice = calculateHyundaiOutdoorBasePrice(totalDays);
    if (terminal === '2T') additionalFee = 10000;
  } else if (profileId === 'hyundai-indoor-pricing') {
    totalPrice = calculateHyundaiIndoorBasePrice(totalDays);
    if (terminal === '2T') additionalFee = 10000;
  } else if (profileId === 'chungho-outdoor-pricing') {
    totalPrice = calculateChunghoOutdoorBasePrice(totalDays);
    if (terminal === '2T') additionalFee = 20000;
  } else if (profileId === 'royal-outdoor-pricing') {
    totalPrice = calculateRoyalOutdoorBasePrice(totalDays);
  } else if (profileId === 'onmaeum-outdoor-pricing') {
    totalPrice = calculateOnmaeumOutdoorBasePrice(totalDays);
  } else if (profileId === 'chacha-outdoor-pricing') {
    totalPrice = calculateChachaOutdoorBasePrice(totalDays);
  } else {
    const rule = ACTUAL_PRICING_RULES[profileId];
    if (!rule) return 0;

    let basePrice = 0;
    let baseDays = 0;
    let extraPricePerDay = 0;

    if (terminal === '2T') {
      basePrice = rule.basePrice2T;
      baseDays = rule.baseDays2T;
      extraPricePerDay = rule.extraPricePerDay2T;
      additionalFee = rule.extraFee2T;
    } else {
      basePrice = rule.basePrice1T;
      baseDays = rule.baseDays1T;
      extraPricePerDay = rule.extraPricePerDay1T;
    }

    if (totalDays <= baseDays) {
      totalPrice = basePrice;
    } else {
      const extraDays = totalDays - baseDays;
      totalPrice = basePrice + extraDays * extraPricePerDay;
    }
  }

  totalPrice += additionalFee;
  totalPrice = addProfileNightSurcharges(profileId, terminal, totalPrice, options);
  totalPrice = addSameDayBookingFee(profileId, totalPrice, options);
  totalPrice = addWinterDepartureFee(profileId, totalPrice, options);

  if (isCard) {
    totalPrice = Math.floor(totalPrice * 1.1);
  }

  return totalPrice;
}

/** 실내/야외별 요금 프로필이 있으면 검색 조건에 맞게 선택 */
export function resolveCompanyPricingProfile(
  company: Company,
  isIndoor: boolean
): string | undefined {
  if (isIndoor && company.indoorPricingProfile) {
    return company.indoorPricingProfile;
  }
  if (!isIndoor && company.outdoorPricingProfile) {
    return company.outdoorPricingProfile;
  }
  return company.pricingProfile;
}

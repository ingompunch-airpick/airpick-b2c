import type { Company } from '../types';

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
};

/** @deprecated PROFILE_NIGHT_SURCHARGE_CONFIG 사용 */
export const PROFILE_NIGHT_SURCHARGE_TIERS = Object.fromEntries(
  Object.entries(PROFILE_NIGHT_SURCHARGE_CONFIG).map(([id, cfg]) => [id, cfg.departureTiers])
) as Record<string, NightSurchargeTier[]>;

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
  } else if (profileId === 'onair-indoor-pricing') {
    totalPrice = calculateOnairIndoorBasePrice(totalDays);
    if (terminal === '2T') additionalFee = 20000;
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

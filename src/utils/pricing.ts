import type { Company } from '../types';
import {
  calculateGayuBasePrice,
  type PricingTerminal,
} from './pricingProfiles';

export const WAWA_FEE_DEFAULTS: Partial<Company> = {
  outdoorBasePrice: 40000,
  outdoorBaseDays: 1,
  outdoorExtraPrice: 5000,
  indoorBasePrice: 40000,
  indoorBaseDays: 1,
  indoorExtraPrice: 10000,
  base_price: 40000,
  base_days: 1,
  extra_day_price: 5000,
  surchargePrice: 10000,
  surchargeStartTime: '20:00',
  surchargeEndTime: '04:00',
  t2Surcharge: 0,
};

export function isWawaCompany(companyId?: string, companyName?: string): boolean {
  const id = (companyId || '').trim().toLowerCase();
  const name = (companyName || '').trim().toLowerCase();
  return (
    id === 'wawa' ||
    id === 'wawa_valet' ||
    name.includes('wawa') ||
    companyName?.includes('와와') === true
  );
}

export function isGayuCompany(companyId?: string, companyName?: string): boolean {
  const id = (companyId || '').trim().toLowerCase();
  const name = (companyName || '').trim().toLowerCase();
  return (
    id === 'gayu' ||
    id === 'gayu_valet' ||
    id === 'gy' ||
    name.includes('gayu') ||
    companyName?.includes('가유') === true
  );
}

export function mergePartnerPricing(partner: Company): Company {
  if (isGayuCompany(partner.id, partner.name)) {
    return {
      ...partner,
      pricingProfile: 'gayu-pricing',
      supports_indoor: false,
      supports_outdoor: true,
      is_indoor: false,
      isAirpickPartner: partner.isAirpickPartner !== false,
      surchargePrice: Number(partner.surchargePrice) || 10000,
      surchargeStartTime: partner.surchargeStartTime || '19:00',
      surchargeEndTime: partner.surchargeEndTime || '05:00',
    };
  }

  if (!isWawaCompany(partner.id, partner.name)) {
    return partner;
  }
  const d = WAWA_FEE_DEFAULTS;
  return {
    ...partner,
    outdoorBasePrice: Number(partner.outdoorBasePrice) || d.outdoorBasePrice!,
    outdoorBaseDays: Number(partner.outdoorBaseDays) || d.outdoorBaseDays!,
    outdoorExtraPrice: Number(partner.outdoorExtraPrice) || d.outdoorExtraPrice!,
    indoorBasePrice: Number(partner.indoorBasePrice) || d.indoorBasePrice!,
    indoorBaseDays: Number(partner.indoorBaseDays) || d.indoorBaseDays!,
    indoorExtraPrice: Number(partner.indoorExtraPrice) || d.indoorExtraPrice!,
    base_price: Number(partner.base_price) || d.base_price!,
    base_days: Number(partner.base_days) || d.base_days!,
    extra_day_price: Number(partner.extra_day_price) || d.extra_day_price!,
    surchargePrice: Number(partner.surchargePrice) || d.surchargePrice!,
    surchargeStartTime: partner.surchargeStartTime || d.surchargeStartTime!,
    surchargeEndTime: partner.surchargeEndTime || d.surchargeEndTime!,
    t2Surcharge: Number(partner.t2Surcharge) ?? d.t2Surcharge!,
  };
}

export function getParkingDayCount(start: string, end: string): number {
  const parseDay = (val: string): Date | null => {
    if (!val) return null;
    let clean = val.trim();
    if (clean.includes('T')) clean = clean.split('T')[0];
    else if (clean.includes(' ')) clean = clean.split(' ')[0];
    clean = clean.replace(/[\.\/]/g, '-');
    const parts = clean.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]);
  };

  const s = parseDay(start);
  const e = parseDay(end);
  if (!s || !e) return 1;

  s.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);
  const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff + 1);
}

export function checkIsNightSurcharge(timeStr: string, startTime: string, endTime: string): boolean {
  try {
    if (!timeStr || !startTime || !endTime) return false;

    let timePart = '';
    if (timeStr.includes('T')) timePart = timeStr.split('T')[1];
    else if (timeStr.includes(' ')) timePart = timeStr.trim().split(/\s+/)[1] || '';
    else if (timeStr.includes(':')) timePart = timeStr;

    if (!timePart) return false;

    const hourStr = timePart.substring(0, 5);
    const [h, m] = hourStr.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return false;
    const currentMinutes = h * 60 + m;

    const [sth, stm] = startTime.split(':').map(Number);
    const startTimeMinutes = sth * 60 + stm;
    const [eth, etm] = endTime.split(':').map(Number);
    const endTimeMinutes = eth * 60 + etm;

    if (startTimeMinutes > endTimeMinutes) {
      return currentMinutes >= startTimeMinutes || currentMinutes < endTimeMinutes;
    }
    return currentMinutes >= startTimeMinutes && currentMinutes < endTimeMinutes;
  } catch {
    return false;
  }
}

export interface PriceBreakdown {
  days: number;
  isIndoor: boolean;
  basePrice: number;
  baseDays: number;
  extraDays: number;
  extraAmount: number;
  nightSurcharge: number;
  nightDetails: string[];
  t2Surcharge: number;
  peakSurcharge: number;
  total: number;
}

export function getPriceBreakdown(
  company: Company,
  start: string,
  end: string,
  indoor: boolean,
  isT2: boolean,
  departureTime = '10:00',
  arrivalTime = '10:00',
  isCardPayment = false
): PriceBreakdown {
  const priced = mergePartnerPricing(company);
  const days = getParkingDayCount(start, end);

  if (isGayuCompany(company.id, company.name) || priced.pricingProfile === 'gayu-pricing') {
    const terminal: PricingTerminal = isT2 ? '2T' : '1T';
    const baseTotal = calculateGayuBasePrice(days, terminal);
    const nightStart = priced.surchargeStartTime || '19:00';
    const nightEnd = priced.surchargeEndTime || '05:00';
    const nightFee = Number(priced.surchargePrice) || 10000;

    let nightSurcharge = 0;
    const nightDetails: string[] = [];
    if (checkIsNightSurcharge(`${start} ${departureTime}`, nightStart, nightEnd)) {
      nightSurcharge += nightFee;
      nightDetails.push(`입차 +${nightFee.toLocaleString()}원`);
    }
    if (checkIsNightSurcharge(`${end} ${arrivalTime}`, nightStart, nightEnd)) {
      nightSurcharge += nightFee;
      nightDetails.push(`출차 +${nightFee.toLocaleString()}원`);
    }

    let total = baseTotal + nightSurcharge;
    if (isCardPayment) {
      total = Math.floor(total * 1.1);
    }

    return {
      days,
      isIndoor: false,
      basePrice: baseTotal,
      baseDays: terminal === '2T' ? 4 : 3,
      extraDays: Math.max(0, days - (terminal === '2T' ? 4 : 3)),
      extraAmount: Math.max(0, baseTotal - (terminal === '2T' ? 50000 : 40000)),
      nightSurcharge,
      nightDetails,
      t2Surcharge: 0,
      peakSurcharge: 0,
      total,
    };
  }

  let basePrice = 0;
  let extraUnit = 0;
  let baseDays = 0;

  if (indoor) {
    basePrice = priced.indoorBasePrice ?? priced.base_price ?? 0;
    baseDays = priced.indoorBaseDays ?? priced.base_days ?? 0;
    extraUnit = priced.indoorExtraPrice ?? priced.extra_day_price ?? 0;
  } else {
    basePrice = priced.outdoorBasePrice ?? priced.base_price ?? 0;
    baseDays = priced.outdoorBaseDays ?? priced.base_days ?? 0;
    extraUnit = priced.outdoorExtraPrice ?? priced.extra_day_price ?? 0;
  }

  const cleanBaseDays = Number(baseDays) || 0;
  const extraDays = Math.max(0, days - cleanBaseDays);
  const extraAmount = extraDays * (Number(extraUnit) || 0);

  let nightSurcharge = 0;
  const nightDetails: string[] = [];
  if (priced.surchargePrice && priced.surchargeStartTime && priced.surchargeEndTime) {
    const charge = Number(priced.surchargePrice) || 0;
    const startWithTime = `${start} ${departureTime}`;
    const endWithTime = `${end} ${arrivalTime}`;
    if (checkIsNightSurcharge(startWithTime, priced.surchargeStartTime, priced.surchargeEndTime)) {
      nightSurcharge += charge;
      nightDetails.push(`입차 +${charge.toLocaleString()}원`);
    }
    if (checkIsNightSurcharge(endWithTime, priced.surchargeStartTime, priced.surchargeEndTime)) {
      nightSurcharge += charge;
      nightDetails.push(`출차 +${charge.toLocaleString()}원`);
    }
  }

  const t2Surcharge = isT2 && priced.t2Surcharge ? Number(priced.t2Surcharge) || 0 : 0;

  let peakSurcharge = 0;
  if (priced.peakSurcharge && priced.peakStartTime && priced.peakEndTime) {
    try {
      const checkInDateObj = new Date(start);
      const mm = String(checkInDateObj.getMonth() + 1).padStart(2, '0');
      const dd = String(checkInDateObj.getDate()).padStart(2, '0');
      const checkInMD = `${mm}-${dd}`;
      let isPeak = false;
      if (priced.peakStartTime > priced.peakEndTime) {
        isPeak = checkInMD >= priced.peakStartTime || checkInMD <= priced.peakEndTime;
      } else {
        isPeak = checkInMD >= priced.peakStartTime && checkInMD <= priced.peakEndTime;
      }
      if (isPeak) peakSurcharge = Number(priced.peakSurcharge) || 0;
    } catch {
      /* ignore */
    }
  }

  const total =
    (Number(basePrice) || 0) + extraAmount + nightSurcharge + t2Surcharge + peakSurcharge;

  return {
    days,
    isIndoor: indoor,
    basePrice: Number(basePrice) || 0,
    baseDays: cleanBaseDays,
    extraDays,
    extraAmount,
    nightSurcharge,
    nightDetails,
    t2Surcharge,
    peakSurcharge,
    total,
  };
}

export function calculatePrice(
  company: Company,
  start: string,
  end: string,
  indoor: boolean,
  isT2: boolean,
  departureTime = '10:00',
  arrivalTime = '10:00',
  isCardPayment = false
): number {
  return getPriceBreakdown(
    company,
    start,
    end,
    indoor,
    isT2,
    departureTime,
    arrivalTime,
    isCardPayment
  ).total;
}

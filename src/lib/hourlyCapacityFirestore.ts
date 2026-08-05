import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  evaluateHourlyCapacity,
  isHourlyCapActive,
  parseDepartureHour,
  type HourlyCapCompany,
  type HourlyCapacityResult,
} from '../utils/hourlyCapacity';

/** 와와 계열 — 문서 companyId 별칭 합산 (B2B와 동일) */
const WAWA_FIRESTORE_COMPANY_IDS = ['wawa', 'wawa_valet', '와와', '와와발렛'];

function expandCompanyIds(companyId: string): string[] {
  const norm = companyId.trim().toLowerCase();
  if (!norm) return [];
  if (norm === 'wawa' || norm === 'wawa_valet') {
    return [...WAWA_FIRESTORE_COMPANY_IDS];
  }
  return [companyId.trim()];
}

function normalizeDateYmd(raw: string): string {
  const m = String(raw || '')
    .trim()
    .replace(/[./]/g, '-')
    .slice(0, 10)
    .match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!m) return '';
  return `${m[1]}-${m[2]!.padStart(2, '0')}-${m[3]!.padStart(2, '0')}`;
}

/**
 * capacity/{companyId}__{날짜} — 시간대별 대수만 담긴 집계 문서.
 * 예약 문서에는 손님 연락처·차량번호가 있어 브라우저에서 직접 조회하지 않는다.
 * 갱신은 B2B Functions(onReservationSync)가 한다.
 */
async function fetchCapacityHours(
  companyId: string,
  date: string
): Promise<Record<string, number>> {
  const ids = expandCompanyIds(companyId);
  if (!ids.length) return {};

  const snaps = await Promise.all(
    ids.map((id) => getDoc(doc(db, 'capacity', `${id}__${date}`)))
  );

  const merged: Record<string, number> = {};
  for (const snap of snaps) {
    if (!snap.exists()) continue;
    const hours = (snap.data() as { hours?: Record<string, unknown> }).hours ?? {};
    for (const [key, value] of Object.entries(hours)) {
      const n = Number(value);
      if (!Number.isFinite(n)) continue;
      merged[key] = (merged[key] ?? 0) + n;
    }
  }
  return merged;
}

export async function countReservationsInDepartureHour(
  companyId: string,
  departureDate: string,
  departureTime: string
): Promise<{ count: number; hour: number | null }> {
  const hour = parseDepartureHour(departureTime);
  if (hour === null) return { count: 0, hour: null };

  const date = normalizeDateYmd(departureDate);
  if (!date) return { count: 0, hour };

  const hours = await fetchCapacityHours(companyId, date);
  return { count: Number(hours[String(hour)] ?? 0), hour };
}

export async function fetchCompanyHourlyCap(companyId: string): Promise<HourlyCapCompany | null> {
  const snap = await getDoc(doc(db, 'companies', companyId));
  if (!snap.exists()) return null;
  const data = snap.data() as Record<string, unknown>;
  return {
    hourlyCapEnabled: data.hourlyCapEnabled === true,
    maxCarsPerHour:
      typeof data.maxCarsPerHour === 'number'
        ? data.maxCarsPerHour
        : Number(data.maxCarsPerHour) || undefined,
  };
}

export async function checkHourlyCapacityForBooking(
  company: HourlyCapCompany,
  companyId: string,
  departureDate: string,
  departureTime: string
): Promise<HourlyCapacityResult> {
  if (!isHourlyCapActive(company)) {
    return evaluateHourlyCapacity({
      company,
      departureDate,
      departureTime,
      existingCount: 0,
    });
  }

  const { count } = await countReservationsInDepartureHour(
    companyId,
    departureDate,
    departureTime
  );

  return evaluateHourlyCapacity({
    company,
    departureDate,
    departureTime,
    existingCount: count,
  });
}

/** 한도 초과·시각 오류 시 Error throw. OFF면 즉시 통과. */
export async function assertHourlyCapacityAvailable(
  companyId: string,
  departureDate: string,
  departureTime: string,
  companyHint?: HourlyCapCompany | null
): Promise<void> {
  const company = companyHint ?? (await fetchCompanyHourlyCap(companyId));
  if (!company || !isHourlyCapActive(company)) return;

  const result = await checkHourlyCapacityForBooking(
    company,
    companyId,
    departureDate,
    departureTime
  );
  if (!result.ok) {
    throw new Error(result.message);
  }
}

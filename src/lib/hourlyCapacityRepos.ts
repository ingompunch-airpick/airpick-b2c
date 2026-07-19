import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import {
  evaluateHourlyCapacity,
  isHourlyCapActive,
  parseDepartureHour,
  reservationInHourBucket,
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

async function fetchDayReservations(
  companyId: string,
  departureDate: string
): Promise<Array<{ departureDate?: string; departureTime?: string; status?: string }>> {
  const date = normalizeDateYmd(departureDate);
  if (!date) return [];

  const ids = expandCompanyIds(companyId);
  if (!ids.length) return [];

  const base = collection(db, 'reservations');
  const snaps =
    ids.length === 1
      ? [await getDocs(query(base, where('companyId', '==', ids[0]), where('departureDate', '==', date)))]
      : [
          await getDocs(
            query(base, where('companyId', 'in', ids.slice(0, 10)), where('departureDate', '==', date))
          ),
        ];

  const byId = new Map<string, { departureDate?: string; departureTime?: string; status?: string }>();
  for (const snap of snaps) {
    for (const d of snap.docs) {
      byId.set(d.id, d.data() as { departureDate?: string; departureTime?: string; status?: string });
    }
  }
  return Array.from(byId.values());
}

export async function countReservationsInDepartureHour(
  companyId: string,
  departureDate: string,
  departureTime: string
): Promise<{ count: number; hour: number | null }> {
  const hour = parseDepartureHour(departureTime);
  if (hour === null) return { count: 0, hour: null };

  const rows = await fetchDayReservations(companyId, departureDate);
  const count = rows.filter((r) => reservationInHourBucket(r, departureDate, hour)).length;
  return { count, hour };
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

/**
 * 한도 초과·시각 오류 시 Error throw. OFF면 즉시 통과.
 * 호출 전 ensureAnonymousAuth() 필요 (reservations 읽기).
 */
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

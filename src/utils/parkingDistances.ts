import type { CompanyParkingDistances, ParkingDistanceEntry, Terminal } from '../types';

function parseDistanceEntry(raw: unknown): ParkingDistanceEntry | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const data = raw as Record<string, unknown>;
  const distanceKm = Number(data.distanceKm);
  if (Number.isNaN(distanceKm) || distanceKm < 0) return undefined;

  return {
    distanceKm,
    driveMinutes: Number(data.driveMinutes) > 0 ? Number(data.driveMinutes) : undefined,
    parkingLotName: data.parkingLotName ? String(data.parkingLotName).trim() : undefined,
    parkingLotAddress: data.parkingLotAddress
      ? String(data.parkingLotAddress).trim()
      : undefined,
    effectiveFrom: data.effectiveFrom ? String(data.effectiveFrom) : undefined,
    updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
  };
}

function parseDistancesMap(raw: unknown): CompanyParkingDistances | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const map = raw as Record<string, unknown>;
  const result: CompanyParkingDistances = {};
  const t1 = parseDistanceEntry(map.T1);
  const t2 = parseDistanceEntry(map.T2);
  if (t1) result.T1 = t1;
  if (t2) result.T2 = t2;
  return Object.keys(result).length > 0 ? result : undefined;
}

function parseLegacyFlat(data: Record<string, unknown>): CompanyParkingDistances | undefined {
  const result: CompanyParkingDistances = {};
  const legacyT1 =
    data.terminalDistanceKmT1 != null
      ? parseDistanceEntry({
          distanceKm: data.terminalDistanceKmT1,
          driveMinutes: data.terminalDriveMinutesT1,
        })
      : undefined;
  const legacyT2 =
    data.terminalDistanceKmT2 != null
      ? parseDistanceEntry({
          distanceKm: data.terminalDistanceKmT2,
          driveMinutes: data.terminalDriveMinutesT2,
        })
      : undefined;
  if (legacyT1) result.T1 = legacyT1;
  if (legacyT2) result.T2 = legacyT2;
  return Object.keys(result).length > 0 ? result : undefined;
}

export interface ParsedCompanyDistances {
  parkingDistances?: CompanyParkingDistances;
  parkingDistancesIndoor?: CompanyParkingDistances;
  parkingDistancesOutdoor?: CompanyParkingDistances;
}

/** Firestore companies 거리 필드 파싱 */
export function parseAllParkingDistancesFromFirestore(
  data: Record<string, unknown>
): ParsedCompanyDistances {
  const legacyNested = parseDistancesMap(data.parkingDistances);
  const legacyFlat = parseLegacyFlat(data);
  const parkingDistances = legacyNested ?? legacyFlat;
  const indoor = parseDistancesMap(data.parkingDistancesIndoor);
  const outdoor = parseDistancesMap(data.parkingDistancesOutdoor);

  return {
    parkingDistances,
    parkingDistancesIndoor: indoor,
    parkingDistancesOutdoor: outdoor,
  };
}

/** @deprecated parseAllParkingDistancesFromFirestore 사용 */
export function parseParkingDistancesFromFirestore(
  data: Record<string, unknown>
): CompanyParkingDistances | undefined {
  return parseAllParkingDistancesFromFirestore(data).parkingDistances;
}

/** 예약/검색 주차 유형에 맞는 T1/T2 거리 맵 */
export function resolveParkingDistancesForLot(
  company: {
    parkingDistances?: CompanyParkingDistances;
    parkingDistancesIndoor?: CompanyParkingDistances;
    parkingDistancesOutdoor?: CompanyParkingDistances;
  },
  isIndoor: boolean
): CompanyParkingDistances | undefined {
  const byLot = isIndoor ? company.parkingDistancesIndoor : company.parkingDistancesOutdoor;
  return byLot ?? company.parkingDistances;
}

export function resolveParkingDistanceEntry(
  company: {
    parkingDistances?: CompanyParkingDistances;
    parkingDistancesIndoor?: CompanyParkingDistances;
    parkingDistancesOutdoor?: CompanyParkingDistances;
  },
  terminal: Terminal,
  isIndoor: boolean
): ParkingDistanceEntry | undefined {
  return resolveParkingDistancesForLot(company, isIndoor)?.[terminal];
}

import type { ParkingDistanceEntry, Terminal } from '../types';

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

/** Firestore `parkingDistances` 또는 레거시 flat 필드 */
export function parseParkingDistancesFromFirestore(
  data: Record<string, unknown>
): Partial<Record<Terminal, ParkingDistanceEntry>> | undefined {
  const result: Partial<Record<Terminal, ParkingDistanceEntry>> = {};

  const nested = data.parkingDistances;
  if (nested && typeof nested === 'object') {
    const map = nested as Record<string, unknown>;
    const t1 = parseDistanceEntry(map.T1);
    const t2 = parseDistanceEntry(map.T2);
    if (t1) result.T1 = t1;
    if (t2) result.T2 = t2;
  }

  const legacyT1 =
    data.terminalDistanceKmT1 != null
      ? parseDistanceEntry({ distanceKm: data.terminalDistanceKmT1, driveMinutes: data.terminalDriveMinutesT1 })
      : undefined;
  const legacyT2 =
    data.terminalDistanceKmT2 != null
      ? parseDistanceEntry({ distanceKm: data.terminalDistanceKmT2, driveMinutes: data.terminalDriveMinutesT2 })
      : undefined;
  if (legacyT1 && !result.T1) result.T1 = legacyT1;
  if (legacyT2 && !result.T2) result.T2 = legacyT2;

  return Object.keys(result).length > 0 ? result : undefined;
}

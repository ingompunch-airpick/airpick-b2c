import type { Company, Terminal } from '../types';
import { resolveParkingDistanceEntry, resolveParkingDistancesForLot } from './parkingDistances';
import { displayInsuranceLabel } from './trust';

const TERMINALS: Terminal[] = ['T1', 'T2'];

/** B2B parkingDistances — 주차장명·주소 라벨 */
export function formatParkingDistanceLotLabel(
  company: Company,
  terminal: Terminal,
  isIndoor = true
): string | undefined {
  const entry = resolveParkingDistanceEntry(company, terminal, isIndoor);
  if (!entry) return undefined;
  const parts = [entry.parkingLotAddress?.trim(), entry.parkingLotName?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : undefined;
}

function hasParkingDistanceEntry(company: Company): boolean {
  const maps = [
    company.parkingDistancesIndoor,
    company.parkingDistancesOutdoor,
    company.parkingDistances,
  ].filter(Boolean);
  if (maps.length === 0) return false;
  return maps.some((map) =>
    TERMINALS.some((terminal) => {
      const entry = map?.[terminal];
      return entry != null && entry.distanceKm != null && entry.distanceKm >= 0;
    })
  );
}

function hasParkingLotInfoFromDistances(company: Company): boolean {
  return (
    !!formatParkingDistanceLotLabel(company, 'T1', true) ||
    !!formatParkingDistanceLotLabel(company, 'T2', true) ||
    !!formatParkingDistanceLotLabel(company, 'T1', false) ||
    !!formatParkingDistanceLotLabel(company, 'T2', false)
  );
}

export function companyHasParkingLocation(company: Company): boolean {
  if (company.indoorParkingAddress?.trim() || company.outdoorParkingAddress?.trim()) {
    return true;
  }
  /** B2B 터미널 거리·주차장 등록 (parkingLots/레거시 주소 없을 때) */
  return hasParkingLotInfoFromDistances(company) || hasParkingDistanceEntry(company);
}

export function companyHasParkingPhotos(company: Company): boolean {
  const indoor = company.indoorParkingPhotos?.length || 0;
  const outdoor = company.outdoorParkingPhotos?.length || 0;
  return indoor + outdoor > 0;
}

export function shouldShowLocationBadge(company: Company): boolean {
  if (company.sharesParkingLocation === false) return false;
  return companyHasParkingLocation(company);
}

export function shouldShowPhotosBadge(company: Company): boolean {
  if (company.sharesPhotos === false) return false;
  return companyHasParkingPhotos(company);
}

export function shouldShowInsuranceBadge(company: Company): boolean {
  if (company.sharesInsurance === false) return false;
  return !!displayInsuranceLabel(company);
}

/** 검색 주차 유형에 거리 데이터가 있는지 */
export function companyHasDistanceForLot(company: Company, isIndoor: boolean): boolean {
  const map = resolveParkingDistancesForLot(company, isIndoor);
  if (!map) return false;
  return TERMINALS.some(
    (terminal) => map[terminal] != null && map[terminal]!.distanceKm != null && map[terminal]!.distanceKm >= 0
  );
}

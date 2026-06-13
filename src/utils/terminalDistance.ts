import type { BookingSearch, Company, Terminal } from '../types';

export function getTerminalDistanceKm(company: Company, terminal: Terminal): number | null {
  const entry = company.parkingDistances?.[terminal];
  if (entry == null || entry.distanceKm == null || Number.isNaN(entry.distanceKm)) {
    return null;
  }
  if (entry.distanceKm < 0) return null;
  return entry.distanceKm;
}

export function formatTerminalDistanceLabel(km: number | null, terminal: Terminal): string {
  const terminalLabel = terminal === 'T1' ? '1터미널' : '2터미널';
  if (km == null) return `${terminalLabel} 거리 · 등록 대기`;
  if (km < 1) return `${terminalLabel}까지 ${Math.round(km * 1000)}m`;
  const rounded = km >= 10 ? km.toFixed(0) : km.toFixed(1);
  return `${terminalLabel}까지 ${rounded}km`;
}

export function formatTerminalDistanceDetail(
  company: Company,
  terminal: Terminal
): string | undefined {
  const entry = company.parkingDistances?.[terminal];
  if (!entry) return undefined;

  const parts: string[] = [formatTerminalDistanceLabel(entry.distanceKm, terminal)];
  if (entry.driveMinutes != null && entry.driveMinutes > 0) {
    parts.push(`약 ${entry.driveMinutes}분`);
  }
  if (entry.parkingLotName?.trim()) {
    parts.push(entry.parkingLotName.trim());
  }
  return parts.join(' · ');
}

export interface DistanceRankedPartner {
  company: Company;
  price: number;
  distanceKm: number | null;
}

/** 입점 업체만 · 선택 터미널 기준 거리 가까운 순 */
export function sortPartnersByTerminalDistance(
  items: DistanceRankedPartner[]
): DistanceRankedPartner[] {
  return [...items].sort((a, b) => {
    if (a.distanceKm == null && b.distanceKm == null) {
      return a.company.name.localeCompare(b.company.name, 'ko');
    }
    if (a.distanceKm == null) return 1;
    if (b.distanceKm == null) return -1;
    if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
    const ratingDiff = (b.company.rating || 0) - (a.company.rating || 0);
    if (ratingDiff !== 0) return ratingDiff;
    return a.company.name.localeCompare(b.company.name, 'ko');
  });
}

export function terminalDistanceSubtitle(search: BookingSearch, count: number): string {
  const terminalLabel = search.terminal === 'T1' ? '1터미널' : '2터미널';
  return `${count}곳 · ${terminalLabel}까지 주차장 거리순 · 에어픽 인증 입점`;
}

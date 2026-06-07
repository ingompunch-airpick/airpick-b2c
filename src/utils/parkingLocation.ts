import type { Company, Reservation } from '../types';

export function buildNaverMapSearchUrl(address?: string): string | undefined {
  const trimmed = address?.trim();
  if (!trimmed) return undefined;
  return `https://map.naver.com/v5/search/${encodeURIComponent(trimmed)}`;
}

const GENERIC_PARKING_LABELS = new Set([
  '실내 주차장',
  '실외 주차장',
  '실내',
  '실외',
  '미지정',
]);

export function isGenericParkingLabel(value?: string): boolean {
  const trimmed = value?.trim();
  if (!trimmed) return true;
  return GENERIC_PARKING_LABELS.has(trimmed);
}

export function getCompanyParkingLot(
  company: Company | undefined,
  isIndoor: boolean
): { address?: string; mapUrl?: string; label: string } {
  if (isIndoor) {
    const address = company?.indoorParkingAddress?.trim() || undefined;
    return {
      address,
      mapUrl:
        company?.indoorParkingMapUrl?.trim() ||
        buildNaverMapSearchUrl(address),
      label: '실내 주차장',
    };
  }
  const address = company?.outdoorParkingAddress?.trim() || undefined;
  return {
    address,
    mapUrl:
      company?.outdoorParkingMapUrl?.trim() ||
      buildNaverMapSearchUrl(address),
    label: '실외 주차장',
  };
}

/** 손님 MY에 보여줄 주차장 위치 (업체 주소 + 기사 입력 구역) */
export function resolveParkingLocationDisplay(
  reservation: Reservation,
  company?: Company
): { title: string; detail?: string; mapUrl?: string } | null {
  const lot = getCompanyParkingLot(company, reservation.isIndoor);

  const zoneCandidate =
    reservation.parkingSpace?.trim() ||
    (reservation.parkingLocation && !isGenericParkingLabel(reservation.parkingLocation)
      ? reservation.parkingLocation.trim()
      : '');

  const zone = zoneCandidate && !isGenericParkingLabel(zoneCandidate) ? zoneCandidate : undefined;

  if (lot.address) {
    return {
      title: lot.address,
      detail: zone ? `주차 구역 · ${zone}` : lot.label,
      mapUrl: lot.mapUrl || reservation.parkingLocationUrl,
    };
  }

  if (zone) {
    return {
      title: zone,
      mapUrl: reservation.parkingLocationUrl,
    };
  }

  return null;
}

import type { Company, Reservation } from '../types';
import { buildNaverMapSearchUrl } from './naverMap';
import { PARKING_LABEL_INDOOR, PARKING_LABEL_OUTDOOR } from './parkingType';

export { buildNaverMapSearchUrl } from './naverMap';

const GENERIC_PARKING_LABELS = new Set([
  '실내 주차장',
  '야외 주차장',
  '실외 주차장',
  '실내',
  '야외',
  '실외',
  '미지정',
]);

export function isGenericParkingLabel(value?: string): boolean {
  const trimmed = value?.trim();
  if (!trimmed) return true;
  return GENERIC_PARKING_LABELS.has(trimmed);
}

export interface ParkingLocationDisplay {
  title: string;
  detail?: string;
  mapUrl?: string;
  lotPhotos?: string[];
}

export function getCompanyParkingLot(
  company: Company | undefined,
  isIndoor: boolean
): { address?: string; mapUrl?: string; label: string; photos?: string[] } {
  if (isIndoor) {
    const address = company?.indoorParkingAddress?.trim() || undefined;
    return {
      address,
      mapUrl: company?.indoorParkingMapUrl?.trim() || buildNaverMapSearchUrl(address),
      label: `${PARKING_LABEL_INDOOR} 주차장`,
      photos: company?.indoorParkingPhotos,
    };
  }
  const address = company?.outdoorParkingAddress?.trim() || undefined;
  return {
    address,
    mapUrl: company?.outdoorParkingMapUrl?.trim() || buildNaverMapSearchUrl(address),
    label: `${PARKING_LABEL_OUTDOOR} 주차장`,
    photos: company?.outdoorParkingPhotos,
  };
}

/** 손님 MY에 보여줄 주차장 위치 (업체 주소 + 기사 입력 구역 + 지도 + 주차장 사진) */
export function resolveParkingLocationDisplay(
  reservation: Reservation,
  company?: Company
): ParkingLocationDisplay | null {
  const lot = getCompanyParkingLot(company, reservation.isIndoor);

  const zoneCandidate =
    reservation.parkingSpace?.trim() ||
    (reservation.parkingLocation && !isGenericParkingLabel(reservation.parkingLocation)
      ? reservation.parkingLocation.trim()
      : '');

  const zone = zoneCandidate && !isGenericParkingLabel(zoneCandidate) ? zoneCandidate : undefined;

  if (lot.address) {
    const mapUrl = lot.mapUrl || reservation.parkingLocationUrl;
    return {
      title: lot.address,
      detail: zone ? `주차 구역 · ${zone}` : lot.label,
      mapUrl,
      lotPhotos: lot.photos?.length ? lot.photos : undefined,
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

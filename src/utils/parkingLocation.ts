import type { Company, Reservation, Terminal } from '../types';
import { buildNaverMapCoordUrl } from './airportDistance';
import { buildNaverMapSearchUrl } from './naverMap';
import { resolveParkingDistanceEntry } from './parkingDistances';
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
  lat?: number;
  lng?: number;
  /** 예약 출발 터미널 기준 · 예: 약 3.2km · 약 8분 */
  terminalDistanceLabel?: string;
  lotPhotos?: string[];
}

function normalizeTerminal(raw?: string): Terminal {
  return raw?.toUpperCase().includes('T2') ? 'T2' : 'T1';
}

function formatBookedTerminalDistance(
  company: Company | undefined,
  terminal: Terminal,
  isIndoor: boolean
): string | undefined {
  const entry = resolveParkingDistanceEntry(company ?? {}, terminal, isIndoor);
  if (!entry || entry.distanceKm == null || Number.isNaN(entry.distanceKm) || entry.distanceKm < 0) {
    return undefined;
  }
  const terminalLabel = terminal === 'T2' ? '2터미널' : '1터미널';
  const km =
    entry.distanceKm < 1
      ? `${Math.round(entry.distanceKm * 1000)}m`
      : entry.distanceKm >= 10
        ? `${entry.distanceKm.toFixed(0)}km`
        : `${entry.distanceKm.toFixed(1)}km`;
  const minutes =
    entry.driveMinutes != null && entry.driveMinutes > 0
      ? ` · 약 ${entry.driveMinutes}분`
      : '';
  return `${terminalLabel}까지 약 ${km}${minutes}`;
}

export function getCompanyParkingLot(
  company: Company | undefined,
  isIndoor: boolean
): {
  address?: string;
  mapUrl?: string;
  lat?: number;
  lng?: number;
  label: string;
  photos?: string[];
} {
  const galleryFallback = resolveCompanyParkingGallery(company);

  if (isIndoor) {
    const address = company?.indoorParkingAddress?.trim() || undefined;
    const lat = company?.indoorParkingLat;
    const lng = company?.indoorParkingLng;
    const pinMap =
      lat != null && lng != null ? buildNaverMapCoordUrl(lat, lng) : undefined;
    const lotPhotos = company?.indoorParkingPhotos?.filter(Boolean) ?? [];
    return {
      address,
      lat,
      lng,
      mapUrl: company?.indoorParkingMapUrl?.trim() || pinMap || buildNaverMapSearchUrl(address),
      label: `${PARKING_LABEL_INDOOR} 주차장`,
      photos: lotPhotos.length ? lotPhotos : galleryFallback,
    };
  }
  const address = company?.outdoorParkingAddress?.trim() || undefined;
  const lat = company?.outdoorParkingLat;
  const lng = company?.outdoorParkingLng;
  const pinMap =
    lat != null && lng != null ? buildNaverMapCoordUrl(lat, lng) : undefined;
  const lotPhotos = company?.outdoorParkingPhotos?.filter(Boolean) ?? [];
  return {
    address,
    lat,
    lng,
    mapUrl: company?.outdoorParkingMapUrl?.trim() || pinMap || buildNaverMapSearchUrl(address),
    label: `${PARKING_LABEL_OUTDOOR} 주차장`,
    photos: lotPhotos.length ? lotPhotos : galleryFallback,
  };
}

const PLACEHOLDER_PARKING_IMAGE =
  'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80';

/** B2B image_urls / image_url — 플레이스홀더 제외 */
function resolveCompanyParkingGallery(company: Company | undefined): string[] | undefined {
  if (!company) return undefined;
  const fromGallery = (company.image_urls ?? [])
    .map((u) => u.trim())
    .filter((u) => u && !u.startsWith(PLACEHOLDER_PARKING_IMAGE.slice(0, 40)));
  if (fromGallery.length) return fromGallery;

  const primary = company.image_url?.trim();
  if (primary && !primary.includes('photo-1542282088-fe8426682b8f')) {
    return [primary];
  }
  return undefined;
}

/** 손님 MY에 보여줄 주차장 위치 (업체 주소 + 기사 입력 구역 + 지도 + 주차장 사진) */
export function resolveParkingLocationDisplay(
  reservation: Reservation,
  company?: Company
): ParkingLocationDisplay | null {
  const lot = getCompanyParkingLot(company, reservation.isIndoor);
  const terminal = normalizeTerminal(reservation.departureTerminal);
  const terminalDistanceLabel = formatBookedTerminalDistance(
    company,
    terminal,
    reservation.isIndoor
  );

  const zoneCandidate =
    reservation.parkingSpace?.trim() ||
    (reservation.parkingLocation && !isGenericParkingLabel(reservation.parkingLocation)
      ? reservation.parkingLocation.trim()
      : '');

  const zone = zoneCandidate && !isGenericParkingLabel(zoneCandidate) ? zoneCandidate : undefined;

  if (lot.address || (lot.lat != null && lot.lng != null)) {
    const mapUrl = lot.mapUrl || reservation.parkingLocationUrl;
    return {
      title: lot.address || lot.label,
      detail: zone ? `주차 구역 · ${zone}` : lot.label,
      mapUrl,
      lat: lot.lat,
      lng: lot.lng,
      terminalDistanceLabel,
      lotPhotos: lot.photos?.length ? lot.photos : undefined,
    };
  }

  if (zone) {
    return {
      title: zone,
      mapUrl: reservation.parkingLocationUrl,
      terminalDistanceLabel,
    };
  }

  if (terminalDistanceLabel) {
    return {
      title: lot.label,
      terminalDistanceLabel,
    };
  }

  return null;
}

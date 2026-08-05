import type { Company, CompanyParkingLot } from '../types';
import { buildNaverMapCoordUrl } from './airportDistance';
import { buildNaverMapSearchUrl } from './naverMap';
import { PARKING_LABEL_INDOOR, PARKING_LABEL_OUTDOOR } from './parkingType';

type ParkingLotDoc = {
  id?: string;
  type?: string;
  name?: string;
  parkingLotName?: string;
  parkingAddress?: string;
  customerAddress?: string;
  parkingLotAddress?: string;
  detailLocation?: string;
  buildingAddress?: string;
  lat?: unknown;
  lng?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  photos?: string[];
  photoUrls?: string[];
};

function parseCoord(raw: unknown): number | undefined {
  if (raw == null || raw === '') return undefined;
  const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
  if (!Number.isFinite(n)) return undefined;
  return n;
}

function uniqueUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  return urls.filter((raw) => {
    const url = raw?.trim();
    if (!url || seen.has(url)) return false;
    seen.add(url);
    return true;
  });
}

function lotPhotos(lot: ParkingLotDoc): string[] {
  const fromPhotos = Array.isArray(lot.photos) ? lot.photos : [];
  const fromPhotoUrls = Array.isArray(lot.photoUrls) ? lot.photoUrls : [];
  return uniqueUrls([...fromPhotos, ...fromPhotoUrls].map(String));
}

function resolveLotAddress(lot: ParkingLotDoc): string {
  if (lot.parkingAddress?.trim()) return lot.parkingAddress.trim();
  if (lot.customerAddress?.trim()) {
    return [lot.customerAddress.trim(), lot.detailLocation?.trim()].filter(Boolean).join(' · ');
  }
  return [lot.parkingLotAddress?.trim(), lot.buildingAddress?.trim()].filter(Boolean).join(' · ');
}

function nextLotName(lots: CompanyParkingLot[], type: 'indoor' | 'outdoor'): string {
  const prefix = type === 'indoor' ? PARKING_LABEL_INDOOR : PARKING_LABEL_OUTDOOR;
  const count = lots.filter((l) => l.type === type).length + 1;
  return `${prefix}${count}`;
}

function lotMapUrl(address: string, lat?: number, lng?: number, stored?: string): string | undefined {
  if (stored?.trim()) return stored.trim();
  if (lat != null && lng != null) return buildNaverMapCoordUrl(lat, lng);
  return buildNaverMapSearchUrl(address) || undefined;
}

/** B2B parkingLots[] + 레거시 실내/야외 필드 → 표시용 목록 */
export function parseCompanyParkingLots(data: Record<string, unknown>): CompanyParkingLot[] {
  const lots: CompanyParkingLot[] = [];
  const rawLots = Array.isArray(data.parkingLots) ? (data.parkingLots as ParkingLotDoc[]) : [];

  for (const row of rawLots) {
    if (!row || typeof row !== 'object') continue;
    const type = row.type === 'outdoor' ? 'outdoor' : row.type === 'indoor' ? 'indoor' : null;
    if (!type) continue;
    const address = resolveLotAddress(row);
    const lat = parseCoord(row.lat ?? row.latitude);
    const lng = parseCoord(row.lng ?? row.longitude);
    const photos = lotPhotos(row);
    if (!address && lat == null && lng == null && photos.length === 0) continue;
    const name =
      String(row.name || row.parkingLotName || '').trim() || nextLotName(lots, type);
    lots.push({
      id: String(row.id || '').trim() || `${type}-${lots.length + 1}`,
      type,
      name,
      parkingAddress: address,
      lat,
      lng,
      mapUrl: lotMapUrl(address, lat, lng),
      photos: photos.length ? photos : undefined,
    });
  }

  if (lots.length > 0) return lots;

  const indoorAddr = data.indoorParkingAddress ? String(data.indoorParkingAddress).trim() : '';
  const outdoorAddr = data.outdoorParkingAddress ? String(data.outdoorParkingAddress).trim() : '';
  const indoorLat = parseCoord(data.indoorParkingLat);
  const indoorLng = parseCoord(data.indoorParkingLng);
  const outdoorLat = parseCoord(data.outdoorParkingLat);
  const outdoorLng = parseCoord(data.outdoorParkingLng);
  const indoorPhotos = Array.isArray(data.indoorParkingPhotos)
    ? uniqueUrls((data.indoorParkingPhotos as string[]).map(String))
    : [];
  const outdoorPhotos = Array.isArray(data.outdoorParkingPhotos)
    ? uniqueUrls((data.outdoorParkingPhotos as string[]).map(String))
    : [];
  const indoorMap = data.indoorParkingMapUrl ? String(data.indoorParkingMapUrl).trim() : '';
  const outdoorMap = data.outdoorParkingMapUrl ? String(data.outdoorParkingMapUrl).trim() : '';

  if (indoorAddr || indoorLat != null || indoorPhotos.length) {
    lots.push({
      id: 'indoor-1',
      type: 'indoor',
      name: `${PARKING_LABEL_INDOOR} 주차장`,
      parkingAddress: indoorAddr,
      lat: indoorLat,
      lng: indoorLng,
      mapUrl: lotMapUrl(indoorAddr, indoorLat, indoorLng, indoorMap),
      photos: indoorPhotos.length ? indoorPhotos : undefined,
    });
  }
  if (outdoorAddr || outdoorLat != null || outdoorPhotos.length) {
    lots.push({
      id: 'outdoor-1',
      type: 'outdoor',
      name: `${PARKING_LABEL_OUTDOOR} 주차장`,
      parkingAddress: outdoorAddr,
      lat: outdoorLat,
      lng: outdoorLng,
      mapUrl: lotMapUrl(outdoorAddr, outdoorLat, outdoorLng, outdoorMap),
      photos: outdoorPhotos.length ? outdoorPhotos : undefined,
    });
  }

  return lots;
}

/** 상세·예약 UI — 검색 조건(실내/야외) 맞는 곳 먼저 */
export function listCompanyParkingLotsForDisplay(
  company: Company | undefined,
  preferIndoor?: boolean
): CompanyParkingLot[] {
  const lots = company?.parkingLots?.length
    ? company.parkingLots
    : parseCompanyParkingLots({
        indoorParkingAddress: company?.indoorParkingAddress,
        outdoorParkingAddress: company?.outdoorParkingAddress,
        indoorParkingLat: company?.indoorParkingLat,
        indoorParkingLng: company?.indoorParkingLng,
        outdoorParkingLat: company?.outdoorParkingLat,
        outdoorParkingLng: company?.outdoorParkingLng,
        indoorParkingMapUrl: company?.indoorParkingMapUrl,
        outdoorParkingMapUrl: company?.outdoorParkingMapUrl,
        indoorParkingPhotos: company?.indoorParkingPhotos,
        outdoorParkingPhotos: company?.outdoorParkingPhotos,
      });

  if (preferIndoor == null) return lots;
  const preferred = preferIndoor ? 'indoor' : 'outdoor';
  return [...lots].sort((a, b) => {
    if (a.type === preferred && b.type !== preferred) return -1;
    if (b.type === preferred && a.type !== preferred) return 1;
    return 0;
  });
}

/** B2B parkingLots[] 또는 레거시 필드 → B2C 표시용 주소·지도·핀·주차장 사진 */
export function deriveParkingAddressesFromCompanyData(data: Record<string, unknown>): {
  indoorParkingAddress?: string;
  outdoorParkingAddress?: string;
  indoorParkingMapUrl?: string;
  outdoorParkingMapUrl?: string;
  indoorParkingLat?: number;
  indoorParkingLng?: number;
  outdoorParkingLat?: number;
  outdoorParkingLng?: number;
  indoorParkingPhotos?: string[];
  outdoorParkingPhotos?: string[];
  parkingLots?: CompanyParkingLot[];
} {
  const parkingLots = parseCompanyParkingLots(data);
  const firstIndoor = parkingLots.find((l) => l.type === 'indoor');
  const firstOutdoor = parkingLots.find((l) => l.type === 'outdoor');
  const indoorPhotos = uniqueUrls(
    parkingLots.filter((l) => l.type === 'indoor').flatMap((l) => l.photos ?? [])
  );
  const outdoorPhotos = uniqueUrls(
    parkingLots.filter((l) => l.type === 'outdoor').flatMap((l) => l.photos ?? [])
  );

  return {
    indoorParkingAddress: firstIndoor?.parkingAddress || undefined,
    outdoorParkingAddress: firstOutdoor?.parkingAddress || undefined,
    indoorParkingMapUrl: firstIndoor?.mapUrl,
    outdoorParkingMapUrl: firstOutdoor?.mapUrl,
    indoorParkingLat: firstIndoor?.lat,
    indoorParkingLng: firstIndoor?.lng,
    outdoorParkingLat: firstOutdoor?.lat,
    outdoorParkingLng: firstOutdoor?.lng,
    indoorParkingPhotos: indoorPhotos.length ? indoorPhotos : undefined,
    outdoorParkingPhotos: outdoorPhotos.length ? outdoorPhotos : undefined,
    parkingLots: parkingLots.length ? parkingLots : undefined,
  };
}

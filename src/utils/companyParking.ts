import { buildNaverMapSearchUrl } from './naverMap';

type ParkingLotDoc = {
  type?: string;
  parkingAddress?: string;
  customerAddress?: string;
  parkingLotAddress?: string;
  detailLocation?: string;
  buildingAddress?: string;
  photos?: string[];
  photoUrls?: string[];
};

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

/** B2B parkingLots[] 또는 레거시 필드 → B2C 표시용 주소·지도·주차장 사진 */
export function deriveParkingAddressesFromCompanyData(data: Record<string, unknown>): {
  indoorParkingAddress?: string;
  outdoorParkingAddress?: string;
  indoorParkingMapUrl?: string;
  outdoorParkingMapUrl?: string;
  indoorParkingPhotos?: string[];
  outdoorParkingPhotos?: string[];
} {
  const indoorLegacy = data.indoorParkingAddress ? String(data.indoorParkingAddress).trim() : '';
  const outdoorLegacy = data.outdoorParkingAddress ? String(data.outdoorParkingAddress).trim() : '';
  const indoorMapStored = data.indoorParkingMapUrl ? String(data.indoorParkingMapUrl).trim() : '';
  const outdoorMapStored = data.outdoorParkingMapUrl ? String(data.outdoorParkingMapUrl).trim() : '';

  const indoorPhotosStored = Array.isArray(data.indoorParkingPhotos)
    ? uniqueUrls((data.indoorParkingPhotos as string[]).map(String))
    : [];
  const outdoorPhotosStored = Array.isArray(data.outdoorParkingPhotos)
    ? uniqueUrls((data.outdoorParkingPhotos as string[]).map(String))
    : [];

  if (indoorLegacy || outdoorLegacy) {
    return {
      indoorParkingAddress: indoorLegacy || undefined,
      outdoorParkingAddress: outdoorLegacy || undefined,
      indoorParkingMapUrl: indoorMapStored || buildNaverMapSearchUrl(indoorLegacy),
      outdoorParkingMapUrl: outdoorMapStored || buildNaverMapSearchUrl(outdoorLegacy),
      indoorParkingPhotos: indoorPhotosStored.length ? indoorPhotosStored : undefined,
      outdoorParkingPhotos: outdoorPhotosStored.length ? outdoorPhotosStored : undefined,
    };
  }

  const lots = Array.isArray(data.parkingLots) ? (data.parkingLots as ParkingLotDoc[]) : [];
  const indoorLots = lots.filter((lot) => lot.type === 'indoor');
  const outdoorLots = lots.filter((lot) => lot.type === 'outdoor');
  const firstIndoor = indoorLots[0];
  const firstOutdoor = outdoorLots[0];
  const indoorAddress = firstIndoor ? resolveLotAddress(firstIndoor) || undefined : undefined;
  const outdoorAddress = firstOutdoor ? resolveLotAddress(firstOutdoor) || undefined : undefined;
  const indoorPhotosFromLots = uniqueUrls(indoorLots.flatMap(lotPhotos));
  const outdoorPhotosFromLots = uniqueUrls(outdoorLots.flatMap(lotPhotos));

  return {
    indoorParkingAddress: indoorAddress,
    outdoorParkingAddress: outdoorAddress,
    indoorParkingMapUrl: indoorMapStored || buildNaverMapSearchUrl(indoorAddress),
    outdoorParkingMapUrl: outdoorMapStored || buildNaverMapSearchUrl(outdoorAddress),
    indoorParkingPhotos:
      indoorPhotosFromLots.length || indoorPhotosStored.length
        ? uniqueUrls([...indoorPhotosFromLots, ...indoorPhotosStored])
        : undefined,
    outdoorParkingPhotos:
      outdoorPhotosFromLots.length || outdoorPhotosStored.length
        ? uniqueUrls([...outdoorPhotosFromLots, ...outdoorPhotosStored])
        : undefined,
  };
}

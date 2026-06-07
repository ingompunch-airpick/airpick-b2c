type ParkingLotDoc = {
  type?: string;
  parkingAddress?: string;
  customerAddress?: string;
  parkingLotAddress?: string;
  detailLocation?: string;
  buildingAddress?: string;
};

function resolveLotAddress(lot: ParkingLotDoc): string {
  if (lot.parkingAddress?.trim()) return lot.parkingAddress.trim();
  if (lot.customerAddress?.trim()) {
    return [lot.customerAddress.trim(), lot.detailLocation?.trim()].filter(Boolean).join(' · ');
  }
  return [lot.parkingLotAddress?.trim(), lot.buildingAddress?.trim()].filter(Boolean).join(' · ');
}

function buildNaverMapSearchUrl(address?: string): string | undefined {
  const trimmed = address?.trim();
  if (!trimmed) return undefined;
  return `https://map.naver.com/v5/search/${encodeURIComponent(trimmed)}`;
}

/** B2B parkingLots[] 또는 레거시 필드 → B2C 표시용 주소·지도 URL */
export function deriveParkingAddressesFromCompanyData(data: Record<string, unknown>): {
  indoorParkingAddress?: string;
  outdoorParkingAddress?: string;
  indoorParkingMapUrl?: string;
  outdoorParkingMapUrl?: string;
} {
  const indoorLegacy = data.indoorParkingAddress ? String(data.indoorParkingAddress).trim() : '';
  const outdoorLegacy = data.outdoorParkingAddress ? String(data.outdoorParkingAddress).trim() : '';
  const indoorMapStored = data.indoorParkingMapUrl ? String(data.indoorParkingMapUrl).trim() : '';
  const outdoorMapStored = data.outdoorParkingMapUrl ? String(data.outdoorParkingMapUrl).trim() : '';

  if (indoorLegacy || outdoorLegacy) {
    return {
      indoorParkingAddress: indoorLegacy || undefined,
      outdoorParkingAddress: outdoorLegacy || undefined,
      indoorParkingMapUrl: indoorMapStored || buildNaverMapSearchUrl(indoorLegacy),
      outdoorParkingMapUrl: outdoorMapStored || buildNaverMapSearchUrl(outdoorLegacy),
    };
  }

  const lots = Array.isArray(data.parkingLots) ? (data.parkingLots as ParkingLotDoc[]) : [];
  const firstIndoor = lots.find((lot) => lot.type === 'indoor');
  const firstOutdoor = lots.find((lot) => lot.type === 'outdoor');
  const indoorAddress = firstIndoor ? resolveLotAddress(firstIndoor) || undefined : undefined;
  const outdoorAddress = firstOutdoor ? resolveLotAddress(firstOutdoor) || undefined : undefined;

  return {
    indoorParkingAddress: indoorAddress,
    outdoorParkingAddress: outdoorAddress,
    indoorParkingMapUrl: indoorMapStored || buildNaverMapSearchUrl(indoorAddress),
    outdoorParkingMapUrl: outdoorMapStored || buildNaverMapSearchUrl(outdoorAddress),
  };
}

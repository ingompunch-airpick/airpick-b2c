import { ICN_TERMINAL_COORDS, type LatLng } from '../utils/airportDistance';
import { getOfficialParkingLot } from './officialParkingLots';
import type { CarParkingType, TransportMode } from '../utils/departureGuide';

export type DriveGoal = LatLng & { label: string };

/**
 * 길찾기 목적지 — 자가용 장기/단기는 공식 주차장, 그 외·대행은 터미널.
 * (예약주차장은 장기 좌표 근사로 동일 취급)
 */
export function resolveDriveGoal(
  terminal: 'T1' | 'T2',
  mode: TransportMode,
  parking?: CarParkingType
): DriveGoal {
  if (mode === 'car' && (parking === 'long' || parking === 'short')) {
    const lot = getOfficialParkingLot(terminal, parking);
    return { lat: lot.lat, lng: lot.lng, label: lot.name };
  }

  const term = ICN_TERMINAL_COORDS[terminal];
  const label =
    mode === 'car' && parking === 'valet'
      ? `${terminal} 터미널 (주차대행 픽업)`
      : mode === 'transit'
        ? `${terminal === 'T2' ? '인천공항2터미널 (대중교통)' : '인천공항1터미널 (대중교통)'}`
        : `${terminal} 터미널`;
  return { lat: term.lat, lng: term.lng, label };
}

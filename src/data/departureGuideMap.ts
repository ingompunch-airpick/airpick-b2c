import type { LatLng } from '../utils/airportDistance';
import type { CarParkingType } from '../utils/departureGuide';
import { getOfficialParkingLot } from './officialParkingLots';

export type GuideMapPinKind = 'park' | 'shuttle_board' | 'alight' | 'terminal';

export interface GuideMapPin {
  id: string;
  label: string;
  hint?: string;
  lat: number;
  lng: number;
  kind: GuideMapPinKind;
}

/** 터미널 하차·진입 포인트 (공식 주차 좌표와 별도) */
const ALIGHT = {
  /** T1 1층 3C 동측 (3번 출입구 건너편) */
  t1Alight3C: { lat: 37.4482, lng: 126.4548 },
  /** T1 1층 13C 서측 (13번 출입구 건너편) */
  t1Alight13C: { lat: 37.4470, lng: 126.4502 },
  /** T2 1층 중앙 5~6번 부근 */
  t2AlightCentral: { lat: 37.4689, lng: 126.4336 },
} as const;

export function buildGuideMapPins(
  terminal: 'T1' | 'T2',
  parking: CarParkingType
): GuideMapPin[] {
  if (parking === 'valet') {
    return [
      {
        id: 'terminal',
        label: terminal === 'T2' ? 'T2 터미널' : 'T1 터미널',
        hint: '픽업 후 안내 동선으로 이동',
        lat: terminal === 'T2' ? ALIGHT.t2AlightCentral.lat : ALIGHT.t1Alight3C.lat,
        lng: terminal === 'T2' ? ALIGHT.t2AlightCentral.lng : ALIGHT.t1Alight3C.lng,
        kind: 'terminal',
      },
    ];
  }

  if (parking === 'short') {
    const lot = getOfficialParkingLot(terminal, 'short');
    const term = terminal === 'T2' ? ALIGHT.t2AlightCentral : ALIGHT.t1Alight3C;
    return [
      {
        id: 'park',
        label: lot.name,
        hint: lot.address,
        lat: lot.lat,
        lng: lot.lng,
        kind: 'park',
      },
      {
        id: 'terminal',
        label: `${terminal} 터미널`,
        hint: '도보로 이동 후 3층 출국장',
        ...term,
        kind: 'terminal',
      },
    ];
  }

  // long-term + shuttle — 좌표는 공식 장기주차 고정값
  const lot = getOfficialParkingLot(terminal, 'long');
  if (terminal === 'T2') {
    return [
      {
        id: 'park',
        label: lot.name,
        hint: lot.address,
        lat: lot.lat,
        lng: lot.lng,
        kind: 'park',
      },
      {
        id: 'alight',
        label: '1층 중앙 하차',
        hint: '5~6번 부근',
        ...ALIGHT.t2AlightCentral,
        kind: 'alight',
      },
    ];
  }

  return [
    {
      id: 'park',
      label: lot.name,
      hint: lot.address,
      lat: lot.lat,
      lng: lot.lng,
      kind: 'park',
    },
    {
      id: 'alight-3c',
      label: '3C 동측',
      hint: '하차 가능',
      ...ALIGHT.t1Alight3C,
      kind: 'alight',
    },
    {
      id: 'alight-13c',
      label: '13C 서측',
      hint: '하차 가능',
      ...ALIGHT.t1Alight13C,
      kind: 'alight',
    },
  ];
}

/** 지도에 그릴 연결선 (주차 → 하차). T1은 주차→3C, 주차→13C 두 갈래 */
export function buildGuideMapPaths(pins: GuideMapPin[]): LatLng[][] {
  const park = pins.find((p) => p.kind === 'park');
  if (!park) return [];
  const alights = pins.filter((p) => p.kind === 'alight' || p.kind === 'terminal');
  return alights.map((a) => [
    { lat: park.lat, lng: park.lng },
    { lat: a.lat, lng: a.lng },
  ]);
}

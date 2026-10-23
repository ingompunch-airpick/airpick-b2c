import type { Terminal } from '../types';

export type PickupPinId = 'short' | 'depart';

export interface PickupPin {
  id: PickupPinId;
  terminal: Terminal;
  /** 지도·예약에 쓰는 장소 이름 */
  name: string;
  /** 버튼에 크게 보이는 행동 */
  action: string;
  /** 버튼 아래 한 줄 */
  detail: string;
  hint: string;
  /** 지도·내비용 도로명/지번 주소 */
  address: string;
  lat: number;
  lng: number;
  /** 출국장 인계면 업체 발렛비가 금액에 포함된다 */
  meetHandoff: boolean;
}

/**
 * 차 맡기는 곳 핀.
 * 좌표는 도로명주소 지오코딩·OSM 기준. 층(B2·3F)은 지도에 못 넣으니 hint에만 적는다.
 */
export const PICKUP_PINS: PickupPin[] = [
  {
    id: 'short',
    terminal: 'T1',
    name: '단기주차장',
    action: '비대면',
    detail: '시간 조율 없이 단기주차장에 세우고 바로 입장',
    hint: '시간 조율 없이 단기주차장에 세우고 바로 입장',
    address: '인천 영종구 공항로 187',
    // 공항로 187 (운서동 2851)
    lat: 37.4466411,
    lng: 126.4551556,
    meetHandoff: false,
  },
  {
    id: 'depart',
    terminal: 'T1',
    name: '출국장',
    action: '대면',
    detail: '시간 맞춘 뒤, 출국장에서 기사에게 직접 넘김',
    hint: '시간 맞춘 뒤, 출국장에서 기사에게 직접 넘김',
    address: '인천 영종구 운서동 2840',
    // OSM «인천공항3층출국장(T1)»
    lat: 37.44916,
    lng: 126.4523611,
    meetHandoff: true,
  },
  {
    id: 'short',
    terminal: 'T2',
    name: '단기주차장',
    action: '비대면',
    detail: '시간 조율 없이 단기주차장에 세우고 바로 입장',
    hint: '시간 조율 없이 단기주차장에 세우고 바로 입장',
    address: '인천 영종구 제2터미널대로 446',
    // 제2여객터미널 서쪽 P 단기 (합동청사 아님)
    lat: 37.4696266,
    lng: 126.4327511,
    meetHandoff: false,
  },
  {
    id: 'depart',
    terminal: 'T2',
    name: '출국장',
    action: '대면',
    detail: '시간 맞춘 뒤, 출국장에서 기사에게 직접 넘김',
    hint: '시간 맞춘 뒤, 출국장에서 기사에게 직접 넘김',
    // 공항로 272는 제1여객터미널 공식 주소라 T2에는 쓰지 않음
    address: '인천 영종구 제2터미널대로 446',
    // 제2여객터미널 건물 일대 (3층 출국 정차)
    lat: 37.468049,
    lng: 126.4342314,
    meetHandoff: true,
  },
];

export function pickupPinsFor(terminal: Terminal): PickupPin[] {
  return PICKUP_PINS.filter((pin) => pin.terminal === terminal);
}

export function pickupPin(terminal: Terminal, id: PickupPinId): PickupPin {
  const pin = PICKUP_PINS.find((item) => item.terminal === terminal && item.id === id);
  if (!pin) throw new Error(`pickup pin missing ${terminal} ${id}`);
  return pin;
}

/** 접수 완료·내 예약에 보여주는 차 맡기는 곳. 장소가 있으면 그 문장, 없으면 방식만. */
export function handoffPlaceLine(
  faceToFace: boolean,
  place?: string
): string {
  const specific = place?.trim();
  if (!faceToFace) return specific ? `비대면 · ${specific}` : '비대면 · 단기주차장';
  return specific ? `대면 · ${specific}` : '대면 · 출국장';
}

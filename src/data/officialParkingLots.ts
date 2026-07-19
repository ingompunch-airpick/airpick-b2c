/**
 * 인천공항 공식 주차장 — 코드에 고정 (시트/Firestore 연동 없음).
 * 주소·내비 검색명은 공개 안내 기준. 좌표는 길찾기용 근사값.
 */
export interface OfficialParkingLot {
  id: string;
  name: string;
  terminal: 'T1' | 'T2';
  /** 장기 | 단기 */
  kind: 'long' | 'short';
  description: string;
  /** 도로명 주소 (내비·표시용) */
  address: string;
  /** 네이버/카카오 검색에 잘 걸리는 명칭 */
  navQuery: string;
  lat: number;
  lng: number;
  phone?: string;
  /** 공식 안내·요금 페이지 */
  infoUrl?: string;
  /** 장기주차장 — 무료 셔틀 API 연동 */
  shuttleEnabled?: boolean;
}

export const OFFICIAL_PARKING_LOTS: OfficialParkingLot[] = [
  {
    id: 'icn-t1-longterm',
    name: 'T1 장기주차장',
    terminal: 'T1',
    kind: 'long',
    description: '셔틀로 터미널 이동 · 1일 이상 주차에 적합',
    address: '인천광역시 중구 공항로 271',
    navQuery: '인천공항 제1여객터미널 장기주차장',
    // 장기주차장역·P구역 일대
    lat: 37.44385,
    lng: 126.45567,
    phone: '032-741-6017',
    infoUrl: 'https://www.airport.kr/ap/ko/t1/parkInfo.do',
    shuttleEnabled: true,
  },
  {
    id: 'icn-t1-shortterm',
    name: 'T1 단기주차장',
    terminal: 'T1',
    kind: 'short',
    description: '터미널 직결 · 단시간 주차 · 높이 2.1m 이하',
    address: '인천광역시 중구 공항로 271',
    navQuery: '인천공항 제1여객터미널 단기주차장',
    lat: 37.44749,
    lng: 126.4524,
    phone: '032-741-6023',
    infoUrl: 'https://www.airport.kr/ap/ko/t1/parkInfo.do',
  },
  {
    id: 'icn-t2-longterm',
    name: 'T2 장기주차장',
    terminal: 'T2',
    kind: 'long',
    description: '셔틀로 터미널 이동 · 1일 이상 주차에 적합',
    address: '인천광역시 중구 제2터미널대로 334',
    navQuery: '인천공항 제2여객터미널 장기주차장',
    lat: 37.4718,
    lng: 126.4365,
    phone: '032-741-0258',
    infoUrl: 'https://www.airport.kr/ap/ko/t2/parkInfo.do',
    shuttleEnabled: true,
  },
  {
    id: 'icn-t2-shortterm',
    name: 'T2 단기주차장',
    terminal: 'T2',
    kind: 'short',
    description: '터미널 직결 · 단시간 주차 · 높이 2.1m 이하',
    address: '인천광역시 중구 제2터미널대로 446',
    navQuery: '인천공항 제2여객터미널 단기주차장',
    lat: 37.46874,
    lng: 126.4334,
    phone: '032-741-0277',
    infoUrl: 'https://www.airport.kr/ap/ko/t2/parkInfo.do',
  },
];

export function getOfficialParkingLot(
  terminal: 'T1' | 'T2',
  kind: 'long' | 'short'
): OfficialParkingLot {
  const lot = OFFICIAL_PARKING_LOTS.find((x) => x.terminal === terminal && x.kind === kind);
  if (!lot) {
    throw new Error(`Official parking lot missing: ${terminal} ${kind}`);
  }
  return lot;
}

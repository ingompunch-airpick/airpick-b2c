/**
 * 인천공항 공식·정보성 주차장 핀 (예약 연동 없음).
 * 좌표는 공개 안내 기준 대략값 — 길찾기는 네이버 딥링크로 연결.
 */
export interface OfficialParkingLot {
  id: string;
  name: string;
  terminal: 'T1' | 'T2';
  description: string;
  lat: number;
  lng: number;
  phone?: string;
  /** 공식 안내·요금 페이지 */
  infoUrl?: string;
}

export const OFFICIAL_PARKING_LOTS: OfficialParkingLot[] = [
  {
    id: 'icn-t1-longterm',
    name: 'T1 장기주차장',
    terminal: 'T1',
    description: '인천공항 제1여객터미널 장기주차장 · 공식 안내 참고',
    lat: 37.4492,
    lng: 126.4558,
    infoUrl: 'https://www.airport.kr/ap/ko/t1/parkInfo.do',
  },
  {
    id: 'icn-t1-shortterm',
    name: 'T1 단기주차장',
    terminal: 'T1',
    description: '제1여객터미널 인근 단기주차 · 공식 요금·만차 안내 확인',
    lat: 37.4479,
    lng: 126.4535,
    infoUrl: 'https://www.airport.kr/ap/ko/t1/parkInfo.do',
  },
  {
    id: 'icn-t2-longterm',
    name: 'T2 장기주차장',
    terminal: 'T2',
    description: '인천공항 제2여객터미널 장기주차장 · 공식 안내 참고',
    lat: 37.4701,
    lng: 126.4352,
    infoUrl: 'https://www.airport.kr/ap/ko/t2/parkInfo.do',
  },
  {
    id: 'icn-t2-shortterm',
    name: 'T2 단기주차장',
    terminal: 'T2',
    description: '제2여객터미널 인근 단기주차 · 공식 요금·만차 안내 확인',
    lat: 37.4692,
    lng: 126.4339,
    infoUrl: 'https://www.airport.kr/ap/ko/t2/parkInfo.do',
  },
];

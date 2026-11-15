/**
 * 인천공항 공식 주차장 요금 스냅샷 — 절약액 산식 정본.
 * 출처 확인 후 asOf·금액을 갱신한다. 숫자 창작 금지.
 *
 * @see https://airport.kr/ap_ko/969/subview.do
 */
export const AIRPORT_PARKING_RATES = {
  sourceUrl: 'https://airport.kr/ap_ko/969/subview.do',
  sourceLabel: '인천국제공항 주차요금',
  /** 스냅샷 확인일 (YYYY-MM-DD) */
  asOf: '2026-11-15',
  /**
   * 장기주차장 소형 1일 최대(원).
   * 1일 이상 여행 비교용. 단기(일 24,000)는 쓰지 않음.
   * 공식 표에 실내·야외·터미널 구분이 없어 동일 적용.
   */
  longTermSmallDailyMaxWon: 9_000,
} as const;

/** 공항 장기 소형 · 체류일수(에어픽 getParkingDayCount와 동일) 기준 추정 요금 */
export function estimateAirportLongTermWon(days: number): number {
  const d = Math.max(1, Math.round(Number(days) || 1));
  return d * AIRPORT_PARKING_RATES.longTermSmallDailyMaxWon;
}

/**
 * 공항 장기 대비 절약액. 0 이하면 미표시용으로 0.
 * airpickDisplayWon = 카드·확인창에 찍는 그 총액.
 */
export function airportParkingSavingsWon(days: number, airpickDisplayWon: number): number {
  const airport = estimateAirportLongTermWon(days);
  const airpick = Math.max(0, Math.round(Number(airpickDisplayWon) || 0));
  return Math.max(0, airport - airpick);
}

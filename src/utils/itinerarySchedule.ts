/**
 * 일정표에서 읽은 비행기 시간 → 예약 일정
 *  - 맡기는 시간 = 출국편 출발 시간 − 손님이 고른 시간(○시간 ○분 전). 자정을 넘으면 전날로.
 *  - 찾는 시간 = 귀국편 인천 도착 시간 (연착은 업체에 자동으로 알려진다)
 */
export function minusMinutes(ymd: string, hm: string, minutes: number): { date: string; time: string } {
  const [y, mo, d] = ymd.split('-').map(Number);
  const [h, mi] = hm.split(':').map(Number);
  const dt = new Date(Date.UTC(y!, mo! - 1, d!, h!, mi!) - minutes * 60_000);
  return {
    date: dt.toISOString().slice(0, 10),
    time: dt.toISOString().slice(11, 16),
  };
}

/** 2027-01-03 → 1월 3일(일) */
export function shortKoreanDate(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const dow = '일월화수목금토'[new Date(Date.UTC(y!, m! - 1, d!)).getUTCDay()];
  return `${m}월 ${d}일(${dow})`;
}

/** 09:30 → 오전 9:30 */
export function koreanClock(hm: string): string {
  const [h, m] = hm.split(':').map(Number);
  const ampm = h! < 12 ? '오전' : '오후';
  const h12 = h! % 12 === 0 ? 12 : h! % 12;
  return `${ampm} ${h12}:${String(m).padStart(2, '0')}`;
}

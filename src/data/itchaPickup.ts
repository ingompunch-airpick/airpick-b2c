/**
 * 가유·시즌·안녕 접수증과 같은 만남 장소.
 * B2B 접수증(itchaPickupGuide)과 같은 문장만 가져온다.
 */

const ITCHA_IDS = new Set(['gayu', 'gayu_valet', 'season', 'hi', 'annyeong']);

const PLACE = {
  T1: '1터미널 지하2층 H26',
  T2: '2터미널 2층 서편 146',
} as const;

function isItchaCompany(companyId?: string, companyName?: string): boolean {
  const id = String(companyId || '')
    .trim()
    .toLowerCase();
  if (ITCHA_IDS.has(id)) return true;
  const name = companyName || '';
  return name.includes('가유') || name.includes('시즌') || name.includes('안녕');
}

function terminalKey(raw?: string): 'T1' | 'T2' | null {
  const t = String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
  if (t === 'T1' || t === '1' || t.includes('제1') || t.includes('1터미널')) return 'T1';
  if (t === 'T2' || t === '2' || t.includes('제2') || t.includes('2터미널')) return 'T2';
  return null;
}

/** 접수증에 찍히는 업체 만남 장소. 없으면 빈 문자열. */
export function itchaHandoffPlace(
  companyId: string | undefined,
  companyName: string | undefined,
  terminal: string | undefined
): string {
  if (!isItchaCompany(companyId, companyName)) return '';
  const key = terminalKey(terminal);
  return key ? PLACE[key] : '';
}

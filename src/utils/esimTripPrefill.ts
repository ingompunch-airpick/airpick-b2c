import { ESIM_COUNTRIES } from '../config/esimCountries';

/** ICN 출발 목적지 공항코드 → 이심 비교 국가코드 */
const AIRPORT_TO_ESIM_COUNTRY: Record<string, string> = {
  NRT: 'JP',
  HND: 'JP',
  KIX: 'JP',
  ITM: 'JP',
  UKB: 'JP',
  NGO: 'JP',
  FUK: 'JP',
  OKA: 'JP',
  CTS: 'JP',
  SDJ: 'JP',
  HIJ: 'JP',
  KOJ: 'JP',
  KMJ: 'JP',
  BKK: 'TH',
  DMK: 'TH',
  HKT: 'TH',
  CNX: 'TH',
  SGN: 'VN',
  HAN: 'VN',
  DAD: 'VN',
  MNL: 'PH',
  CEB: 'PH',
  CRK: 'PH',
  PEK: 'CN',
  PKX: 'CN',
  PVG: 'CN',
  SHA: 'CN',
  CAN: 'CN',
  SZX: 'CN',
  TPE: 'TW',
  TSA: 'TW',
  KHH: 'TW',
  SYD: 'AU',
  MEL: 'AU',
  BNE: 'AU',
  LAX: 'US',
  JFK: 'US',
  EWR: 'US',
  SFO: 'US',
  SEA: 'US',
  HNL: 'US',
  GUM: 'US',
  CDG: 'EU',
  LHR: 'EU',
  FRA: 'EU',
  AMS: 'EU',
  FCO: 'EU',
  MXP: 'EU',
  BCN: 'EU',
  MAD: 'EU',
  VIE: 'EU',
  ZRH: 'EU',
  IST: 'EU',
  PRG: 'EU',
};

const NAME_HINTS: { re: RegExp; code: string }[] = [
  { re: /일본|오키나와|도쿄|오사카|후쿠오카|삿포로|나고야|삿뽀로/, code: 'JP' },
  { re: /태국|방콕|푸켓|치앙마이/, code: 'TH' },
  { re: /베트남|호치민|하노이|다낭/, code: 'VN' },
  { re: /필리핀|마닐라|세부|클락/, code: 'PH' },
  { re: /중국|베이징|상하이|광저우|선전/, code: 'CN' },
  { re: /대만|타이베이|가오슝/, code: 'TW' },
  { re: /호주|시드니|멜버른/, code: 'AU' },
  { re: /미국|로스앤젤레스|뉴욕|샌프란|하와이|괌/, code: 'US' },
  { re: /유럽|파리|런던|프랑크푸르트|로마|바르셀로나/, code: 'EU' },
];

const ALLOWED = new Set(ESIM_COUNTRIES.map((c) => c.code));

/** 출국편 목적지 → 이심 국가코드 (매칭 실패 시 undefined) */
export function resolveEsimCountryFromFlight(args: {
  destinationCode?: string | null;
  destination?: string | null;
}): string | undefined {
  const airport = String(args.destinationCode || '')
    .trim()
    .toUpperCase();
  if (airport) {
    const mapped = AIRPORT_TO_ESIM_COUNTRY[airport];
    if (mapped && ALLOWED.has(mapped)) return mapped;
  }

  const name = String(args.destination || '').trim();
  for (const hint of NAME_HINTS) {
    if (hint.re.test(name) && ALLOWED.has(hint.code)) return hint.code;
  }
  return undefined;
}

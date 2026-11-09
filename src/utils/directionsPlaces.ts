export type DirectionsHandoff = 'drop' | 'curb';
export type DirectionsTerminal = 'T1' | 'T2';

export type DirectionsPlace = {
  handoff: DirectionsHandoff;
  terminal: DirectionsTerminal;
  /** 카드 위 짧은 제목 (쉬운 말) */
  title: string;
  /** 지도·복사에 쓰는 장소명 */
  name: string;
  address: string;
  /** 손님이 할 일 한 줄 */
  howTo: string;
  lat: number;
  lng: number;
};

export const HANDOFF_PAGE: Record<
  DirectionsHandoff,
  { path: string; headline: string; lead: string; choiceLabel: string }
> = {
  drop: {
    path: '/directions/drop',
    headline: '차를 어디에 세우나요?',
    lead: '단기주차장에 차를 세운 뒤 내리시면 됩니다. 예약하신 터미널을 고르고 지도로 길을 찾으세요.',
    choiceLabel: '단기주차장에 세우고 내리기',
  },
  curb: {
    path: '/directions/curb',
    headline: '기사님을 어디서 만나나요?',
    lead: '출국장에서 기사를 만나 차를 맡기시면 됩니다. 예약하신 터미널을 고르고 지도로 길을 찾으세요.',
    choiceLabel: '출국장에서 기사에게 맡기기',
  },
};

/** 인천공항 고정 픽업 — 밋앤그릿은 업체별로 나중에 */
export const DIRECTIONS_PLACES: DirectionsPlace[] = [
  {
    handoff: 'drop',
    terminal: 'T1',
    title: '1터미널 · 단기주차장',
    name: '인천공항 1터미널 지하2층 H26',
    address: '인천광역시 중구 공항로 272 제1여객터미널 지하2층 H26',
    howTo: '지하2층 H26 근처에 차를 세운 뒤 내려 주세요.',
    lat: 37.4475,
    lng: 126.4524,
  },
  {
    handoff: 'drop',
    terminal: 'T2',
    title: '2터미널 · 단기주차장',
    name: '인천공항 2터미널 2층 서편 146',
    address: '인천광역시 중구 공항로 272 제2여객터미널 2층 서편 146',
    howTo: '2층 서편 146번 근처에 차를 세운 뒤 내려 주세요.',
    lat: 37.4493,
    lng: 126.4583,
  },
  {
    handoff: 'curb',
    terminal: 'T1',
    title: '1터미널 · 출국장',
    name: '인천공항 1터미널 3층 출국장',
    address: '인천광역시 중구 공항로 272 제1여객터미널 3층 출국장',
    howTo: '3층 출국장에서 업체 기사님을 만나 차를 맡기세요.',
    lat: 37.4485,
    lng: 126.4512,
  },
  {
    handoff: 'curb',
    terminal: 'T2',
    title: '2터미널 · 출국장',
    name: '인천공항 2터미널 3층 출국장',
    address: '인천광역시 중구 공항로 272 제2여객터미널 3층 출국장',
    howTo: '3층 출국장에서 업체 기사님을 만나 차를 맡기세요.',
    lat: 37.4504,
    lng: 126.4572,
  },
];

export function findDirectionsPlace(
  handoff: DirectionsHandoff,
  terminal: DirectionsTerminal
): DirectionsPlace | undefined {
  return DIRECTIONS_PLACES.find((p) => p.handoff === handoff && p.terminal === terminal);
}

export function naverDirectionsUrl(place: DirectionsPlace): string {
  const name = encodeURIComponent(place.name);
  return `https://map.naver.com/v5/directions/-/-/${place.lng},${place.lat},${name}/car`;
}

export function kakaoDirectionsUrl(place: DirectionsPlace): string {
  return `https://map.kakao.com/link/to/${encodeURIComponent(place.name)},${place.lat},${place.lng}`;
}

export function tmapDirectionsUrl(place: DirectionsPlace): string {
  const q = new URLSearchParams({
    name: place.name,
    lon: String(place.lng),
    lat: String(place.lat),
  });
  return `https://www.tmap.co.kr/tmap2/mobile/tmap.jsp?${q.toString()}`;
}

function normalizeHandoff(raw: string | null | undefined): DirectionsHandoff | null {
  const v = String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, '');
  if (
    v === 'drop' ||
    v === 'dropoff' ||
    v === '드랍' ||
    v === '드랍오프' ||
    v.includes('단기')
  ) {
    return 'drop';
  }
  if (
    v === 'curb' ||
    v === 'curbside' ||
    v === '커브' ||
    v === '커브사이드' ||
    v.includes('출국')
  ) {
    return 'curb';
  }
  return null;
}

function normalizeTerminal(raw: string | null | undefined): DirectionsTerminal | null {
  const v = String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
  if (v === 'T1' || v === '1' || v.includes('제1') || v.includes('1터미널')) return 'T1';
  if (v === 'T2' || v === '2' || v.includes('제2') || v.includes('2터미널')) return 'T2';
  return null;
}

export type DirectionsRoute =
  | { kind: 'hub' }
  | { kind: 'handoff'; handoff: DirectionsHandoff; terminal: DirectionsTerminal | null }
  | { kind: 'token'; token: string };

/**
 * `/directions` → 선택 화면
 * `/directions/drop` · `/directions/curb` → 해당 방식만
 * `/directions/drop/t1`
 * `/directions/{토큰}` · `?t={토큰}` → 예약 기준 자동 안내
 */
export function readDirectionsRoute(pathname: string, search: string): DirectionsRoute {
  const path = pathname.replace(/\/+$/, '') || '/';
  const qs = new URLSearchParams(search);
  const queryToken = String(qs.get('t') || '').trim();

  const withTerminal = path.match(/^\/directions\/([^/]+)\/([^/]+)$/i);
  if (withTerminal) {
    const handoff = normalizeHandoff(withTerminal[1]);
    if (handoff) {
      return {
        kind: 'handoff',
        handoff,
        terminal: normalizeTerminal(withTerminal[2]),
      };
    }
  }

  const oneSeg = path.match(/^\/directions\/([^/]+)$/i);
  if (oneSeg) {
    const seg = oneSeg[1];
    const handoff = normalizeHandoff(seg);
    if (handoff) {
      return { kind: 'handoff', handoff, terminal: null };
    }
    const token = decodeSeg(seg);
    if (token) return { kind: 'token', token };
  }

  if (path === '/directions' && queryToken) {
    return { kind: 'token', token: queryToken };
  }

  const handoff = normalizeHandoff(qs.get('type') || qs.get('handoff'));
  if (handoff) {
    return {
      kind: 'handoff',
      handoff,
      terminal: normalizeTerminal(qs.get('terminal')),
    };
  }

  return { kind: 'hub' };
}

function decodeSeg(raw: string): string {
  try {
    return decodeURIComponent(raw).trim();
  } catch {
    return raw.trim();
  }
}

/** @deprecated readDirectionsRoute 사용 */
export function readDirectionsSelection(pathname: string, search: string): {
  handoff: DirectionsHandoff | null;
  terminal: DirectionsTerminal | null;
} {
  const route = readDirectionsRoute(pathname, search);
  if (route.kind === 'handoff') {
    return { handoff: route.handoff, terminal: route.terminal };
  }
  return { handoff: null, terminal: null };
}

export function handoffPlainLabel(handoff: DirectionsHandoff): string {
  return handoff === 'drop'
    ? '단기주차장에 세우고 내리기'
    : '출국장에서 기사에게 맡기기';
}

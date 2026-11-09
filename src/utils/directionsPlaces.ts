export type DirectionsHandoff = 'drop' | 'curb';
export type DirectionsTerminal = 'T1' | 'T2';

export type DirectionsPlace = {
  handoff: DirectionsHandoff;
  terminal: DirectionsTerminal;
  title: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
};

/** 인천공항 고정 픽업 — 밋앤그릿은 업체별로 나중에 */
export const DIRECTIONS_PLACES: DirectionsPlace[] = [
  {
    handoff: 'drop',
    terminal: 'T1',
    title: '드랍오프 · 1터미널',
    name: '인천공항 1터미널 지하2층 H26',
    address: '인천광역시 중구 공항로 272 제1여객터미널 지하2층 H26',
    lat: 37.4475,
    lng: 126.4524,
  },
  {
    handoff: 'drop',
    terminal: 'T2',
    title: '드랍오프 · 2터미널',
    name: '인천공항 2터미널 2층 서편 146',
    address: '인천광역시 중구 공항로 272 제2여객터미널 2층 서편 146',
    lat: 37.4493,
    lng: 126.4583,
  },
  {
    handoff: 'curb',
    terminal: 'T1',
    title: '커브사이드 · 1터미널',
    name: '인천공항 1터미널 3층 출국장',
    address: '인천광역시 중구 공항로 272 제1여객터미널 3층 출국장',
    lat: 37.4485,
    lng: 126.4512,
  },
  {
    handoff: 'curb',
    terminal: 'T2',
    title: '커브사이드 · 2터미널',
    name: '인천공항 2터미널 3층 출국장',
    address: '인천광역시 중구 공항로 272 제2여객터미널 3층 출국장',
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
  if (v === 'drop' || v === 'dropoff' || v === '드랍' || v === '드랍오프') return 'drop';
  if (v === 'curb' || v === 'curbside' || v === '커브' || v === '커브사이드') return 'curb';
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

/** `/directions/drop/t1` 또는 `?type=drop&terminal=T1` */
export function readDirectionsSelection(pathname: string, search: string): {
  handoff: DirectionsHandoff | null;
  terminal: DirectionsTerminal | null;
} {
  const path = pathname.replace(/\/+$/, '') || '/';
  const m = path.match(/^\/directions\/([^/]+)\/([^/]+)$/i);
  if (m) {
    return {
      handoff: normalizeHandoff(m[1]),
      terminal: normalizeTerminal(m[2]),
    };
  }
  const qs = new URLSearchParams(search);
  return {
    handoff: normalizeHandoff(qs.get('type') || qs.get('handoff')),
    terminal: normalizeTerminal(qs.get('terminal') || qs.get('t')),
  };
}

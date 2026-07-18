/** 홈 지도 허브 카테고리 — 1차 활성 + Coming soon */

export type HomeCategoryId =
  | 'valet'
  | 'lot'
  | 'esim'
  | 'insurance'
  | 'hotel'
  | 'food'
  | 'cafe'
  | 'rental'
  | 'exchange'
  | 'pharmacy'
  | 'travel';

export type HomeCategoryKind = 'place' | 'service' | 'soon';

export interface HomeCategory {
  id: HomeCategoryId;
  label: string;
  kind: HomeCategoryKind;
  /** 지도에 핀을 그릴지 */
  showMapPins: boolean;
}

export const HOME_CATEGORIES: HomeCategory[] = [
  { id: 'valet', label: '주차대행', kind: 'service', showMapPins: true },
  { id: 'lot', label: '주차장', kind: 'place', showMapPins: true },
  { id: 'esim', label: 'eSIM / 유심', kind: 'service', showMapPins: false },
  { id: 'insurance', label: '보험', kind: 'soon', showMapPins: false },
  { id: 'hotel', label: '호텔', kind: 'soon', showMapPins: false },
  { id: 'food', label: '맛집', kind: 'soon', showMapPins: false },
  { id: 'cafe', label: '카페', kind: 'soon', showMapPins: false },
  { id: 'rental', label: '렌터카', kind: 'soon', showMapPins: false },
  { id: 'exchange', label: '환전', kind: 'soon', showMapPins: false },
  { id: 'pharmacy', label: '약국', kind: 'soon', showMapPins: false },
  { id: 'travel', label: '여행소품', kind: 'soon', showMapPins: false },
];

export const DEFAULT_HOME_CATEGORY: HomeCategoryId = 'valet';

export function getHomeCategory(id: string | null | undefined): HomeCategory {
  return HOME_CATEGORIES.find((c) => c.id === id) ?? HOME_CATEGORIES[0]!;
}

export function isHomeCategoryId(value: string): value is HomeCategoryId {
  return HOME_CATEGORIES.some((c) => c.id === value);
}

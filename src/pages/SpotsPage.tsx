import { useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_HOME_CATEGORY,
  getHomeCategory,
  isHomeCategoryId,
  type HomeCategoryId,
} from '../constants/homeCategories';
import {
  getOfficialLotPins,
  listOfficialParkingLots,
} from '../repositories/homeMapRepository';
import AirportMap from '../components/map-home/AirportMap';
import CategoryChips from '../components/map-home/CategoryChips';
import ComingSoonPanel from '../components/map-home/ComingSoonPanel';
import DraggableSheet from '../components/map-home/DraggableSheet';
import HomeSearchBar from '../components/map-home/HomeSearchBar';
import ParkingLotList from '../components/map-home/ParkingLotList';
import { AIRPICK_DEFINITION } from '../constants/companyLegal';
import { ESIM_TAB_LABEL, PARKING_TAB_LABEL, SPOTS_TAB_LABEL } from '../constants/marketing';

function readCatFromUrl(): HomeCategoryId {
  if (typeof window === 'undefined') return DEFAULT_HOME_CATEGORY;
  const cat = new URLSearchParams(window.location.search).get('cat');
  if (cat === 'valet' || cat === 'esim' || cat === 'insurance') return 'lot';
  if (cat === 'rental') return 'luggage';
  return cat && isHomeCategoryId(cat) ? cat : DEFAULT_HOME_CATEGORY;
}

function writeCatToUrl(cat: HomeCategoryId) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (cat === DEFAULT_HOME_CATEGORY) url.searchParams.delete('cat');
  else url.searchParams.set('cat', cat);
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}`);
}

/** 공항주변스팟 — 지도 허브 (출국 동선과 분리) */
export default function SpotsPage() {
  const [categoryId, setCategoryId] = useState<HomeCategoryId>(() => readCatFromUrl());
  const [query, setQuery] = useState('');
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);

  const category = getHomeCategory(categoryId);
  const q = query.trim().toLowerCase();

  useEffect(() => {
    writeCatToUrl(categoryId);
    setSelectedPinId(null);
  }, [categoryId]);

  const lotItems = useMemo(() => {
    const list = listOfficialParkingLots();
    if (!q) return list;
    return list.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.terminal.toLowerCase().includes(q)
    );
  }, [q]);

  const pins = useMemo(() => {
    if (categoryId === 'lot' && category.showMapPins) return getOfficialLotPins();
    return [];
  }, [categoryId, category.showMapPins]);

  const sheetTitle = category.kind === 'soon' ? category.label : '인천공항 주차장';
  const sheetSubtitle =
    category.kind === 'soon'
      ? undefined
      : '공식 주차장 정보 · 예약 없음 · 길찾기·공식 안내';

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden">
      <div className="absolute inset-0 z-0">
        {category.showMapPins ? (
          <AirportMap
            pins={pins}
            selectedPinId={selectedPinId}
            onSelectPin={setSelectedPinId}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-gradient-to-b from-sky-tint to-sky-bg px-6 text-center">
            <p className="text-sm font-bold text-brand">{SPOTS_TAB_LABEL}</p>
            <p className="mt-2 max-w-xs text-xs font-medium leading-relaxed text-muted">
              {category.label}은 곧 열릴 예정입니다. {PARKING_TAB_LABEL}·{ESIM_TAB_LABEL}은 아래
              탭에서 이용하세요.
            </p>
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 px-3 pt-2">
        <div className="pointer-events-auto space-y-2">
          <HomeSearchBar
            value={query}
            onChange={setQuery}
            placeholder={`${SPOTS_TAB_LABEL} · 주차장 검색`}
          />
          <CategoryChips activeId={categoryId} onChange={setCategoryId} />
        </div>
      </div>

      <DraggableSheet title={sheetTitle} subtitle={sheetSubtitle} initialSnap="mid">
        {category.kind === 'soon' ? (
          <ComingSoonPanel label={category.label} />
        ) : (
          <ParkingLotList
            items={lotItems}
            selectedId={selectedPinId}
            onSelect={setSelectedPinId}
          />
        )}

        <p className="mt-6 border-t border-sky-border/60 pt-4 text-[11px] font-medium leading-relaxed text-muted">
          {AIRPICK_DEFINITION}{' '}
          <a href="/parking" className="font-bold text-brand underline-offset-2 hover:underline">
            {PARKING_TAB_LABEL} 비교
          </a>
          {' · '}
          <a href="/esim" className="font-bold text-brand underline-offset-2 hover:underline">
            {ESIM_TAB_LABEL} 비교
          </a>
          {' · '}
          <a href="/guides/" className="font-bold text-brand underline-offset-2 hover:underline">
            가이드
          </a>
        </p>
      </DraggableSheet>
    </div>
  );
}

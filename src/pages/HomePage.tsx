import { useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_HOME_CATEGORY,
  getHomeCategory,
  isHomeCategoryId,
  type HomeCategoryId,
} from '../constants/homeCategories';
import type { Company } from '../types';
import {
  getOfficialLotPins,
  getValetServicePins,
  listEsimCountryCards,
  listOfficialParkingLots,
  listValetPartnerCards,
} from '../repositories/homeMapRepository';
import AirportMap from '../components/map-home/AirportMap';
import CategoryChips from '../components/map-home/CategoryChips';
import ComingSoonPanel from '../components/map-home/ComingSoonPanel';
import DraggableSheet from '../components/map-home/DraggableSheet';
import EsimCountryList from '../components/map-home/EsimCountryList';
import HomeSearchBar from '../components/map-home/HomeSearchBar';
import ParkingLotList from '../components/map-home/ParkingLotList';
import ValetPartnerList from '../components/map-home/ValetPartnerList';
import { AIRPICK_DEFINITION } from '../constants/companyLegal';
import { PRICE_DISCLAIMER } from '../constants/complianceCopy';

function readCatFromUrl(): HomeCategoryId {
  if (typeof window === 'undefined') return DEFAULT_HOME_CATEGORY;
  const cat = new URLSearchParams(window.location.search).get('cat');
  return cat && isHomeCategoryId(cat) ? cat : DEFAULT_HOME_CATEGORY;
}

function writeCatToUrl(cat: HomeCategoryId) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (cat === DEFAULT_HOME_CATEGORY) url.searchParams.delete('cat');
  else url.searchParams.set('cat', cat);
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}`);
}

export default function HomePage({
  companies,
  onOpenParking,
  onOpenEsim,
}: {
  companies: Company[];
  onOpenParking: (companyId?: string) => void;
  onOpenEsim: (countryCode?: string) => void;
}) {
  const [categoryId, setCategoryId] = useState<HomeCategoryId>(() => readCatFromUrl());
  const [query, setQuery] = useState('');
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);

  const category = getHomeCategory(categoryId);
  const q = query.trim().toLowerCase();

  useEffect(() => {
    writeCatToUrl(categoryId);
    setSelectedPinId(null);
  }, [categoryId]);

  const valetCards = useMemo(() => {
    const list = listValetPartnerCards(companies);
    if (!q) return list;
    return list.filter((c) => c.name.toLowerCase().includes(q));
  }, [companies, q]);

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

  const esimCards = useMemo(() => {
    const list = listEsimCountryCards();
    if (!q) return list;
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.countryCode.toLowerCase().includes(q) ||
        'esim'.includes(q) ||
        '유심'.includes(q)
    );
  }, [q]);

  const pins = useMemo(() => {
    if (categoryId === 'valet') return getValetServicePins();
    if (categoryId === 'lot') return getOfficialLotPins();
    return [];
  }, [categoryId]);

  const sheetTitle =
    category.kind === 'soon'
      ? category.label
      : categoryId === 'valet'
        ? '에어픽 입점 · 주차대행'
        : categoryId === 'lot'
          ? '인천공항 주차장'
          : '해외여행 eSIM · 유심';

  const sheetSubtitle =
    category.kind === 'soon'
      ? undefined
      : categoryId === 'valet'
        ? '픽업존만 지도에 표시 · 보관 위치는 예약 후 안내 · 참고가'
        : categoryId === 'lot'
          ? '공식 주차장 정보 · 예약 없음 · 길찾기·공식 안내'
          : '위치 기반이 아닙니다 · 나라별 요금 비교';

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden">
      {/* 지도 — eSIM/soon 은 은은한 배경만 */}
      <div className="absolute inset-0 z-0">
        {category.showMapPins ? (
          <AirportMap
            pins={pins}
            selectedPinId={selectedPinId}
            onSelectPin={(id) => {
              setSelectedPinId(id);
              if (categoryId === 'lot') {
                /* sheet highlights via selectedPinId */
              }
            }}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-gradient-to-b from-sky-tint to-sky-bg px-6 text-center">
            <p className="text-sm font-bold text-brand">에어픽</p>
            <p className="mt-2 max-w-xs text-xs font-medium leading-relaxed text-muted">
              {AIRPICK_DEFINITION}
            </p>
          </div>
        )}
      </div>

      {/* 상단 검색·칩 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 px-3 pt-2">
        <div className="pointer-events-auto space-y-2">
          <HomeSearchBar value={query} onChange={setQuery} />
          <CategoryChips activeId={categoryId} onChange={setCategoryId} />
        </div>
      </div>

      <DraggableSheet title={sheetTitle} subtitle={sheetSubtitle} initialSnap="mid">
        {category.kind === 'soon' ? (
          <ComingSoonPanel label={category.label} />
        ) : categoryId === 'valet' ? (
          <>
            <p className="mb-3 text-[11px] font-medium leading-relaxed text-muted">{PRICE_DISCLAIMER}</p>
            <ValetPartnerList items={valetCards} onReserve={(id) => onOpenParking(id)} />
            <button
              type="button"
              onClick={() => onOpenParking()}
              className="mt-3 w-full rounded-xl bg-sky-tint py-3 text-xs font-bold text-brand"
            >
              전체 요금 비교 보기
            </button>
          </>
        ) : categoryId === 'lot' ? (
          <ParkingLotList
            items={lotItems}
            selectedId={selectedPinId}
            onSelect={setSelectedPinId}
          />
        ) : (
          <>
            <p className="mb-3 text-[11px] font-medium leading-relaxed text-muted">{PRICE_DISCLAIMER}</p>
            <EsimCountryList items={esimCards} onOpen={(code) => onOpenEsim(code)} />
            <button
              type="button"
              onClick={() => onOpenEsim()}
              className="mt-3 w-full rounded-xl bg-sky-tint py-3 text-xs font-bold text-brand"
            >
              eSIM 전체 비교 보기
            </button>
          </>
        )}

        {/* 크롤러·의미 정합용 텍스트 (시각적으로는 시트 하단) */}
        <p className="mt-6 border-t border-sky-border/60 pt-4 text-[11px] font-medium leading-relaxed text-muted">
          {AIRPICK_DEFINITION}{' '}
          <a href="/parking" className="font-bold text-brand underline-offset-2 hover:underline">
            주차대행 비교
          </a>
          {' · '}
          <a href="/esim" className="font-bold text-brand underline-offset-2 hover:underline">
            유심·eSIM 비교
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

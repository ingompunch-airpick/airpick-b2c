import { useState } from 'react';
import CompanyCard from '../components/CompanyCard';
import SearchPanel from '../components/SearchPanel';
import { mergeParkingCompareCompanies, openExternalBooking } from '../lib/parkingCompare';
import type { BookingSearch, Company, CompareSortMode } from '../types';
import {
  buildParkingCompareSections,
  buildPartnerDistanceList,
  isAirpickPartner,
  type PricedCompany,
} from '../utils/compareSort';
import {
  formatTerminalDistanceDetail,
  formatTerminalDistanceLabel,
  getTerminalDistanceKm,
  terminalDistanceSubtitle,
} from '../utils/terminalDistance';
import { cn } from '../utils/cn';

function SortTabs({
  mode,
  onChange,
}: {
  mode: CompareSortMode;
  onChange: (mode: CompareSortMode) => void;
}) {
  const tabs: { id: CompareSortMode; label: string }[] = [
    { id: 'price', label: '가격순' },
    { id: 'distance', label: '거리순' },
  ];

  return (
    <div className="flex rounded-xl bg-sky-soft p-1 shadow-[0_2px_8px_rgba(49,130,246,0.07)]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex-1 rounded-lg py-2 text-sm font-bold transition',
            mode === tab.id ? 'bg-white text-brand shadow-sm' : 'text-muted hover:text-ink'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function CompareSection({
  title,
  subtitle,
  items,
  onSelect,
  distanceMode,
  terminal,
}: {
  title: string;
  subtitle: string;
  items: PricedCompany[];
  onSelect: (company: Company, price: number) => void;
  distanceMode?: boolean;
  terminal?: BookingSearch['terminal'];
}) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="px-1">
        <h3 className="text-sm font-bold text-ink">{title}</h3>
        <p className="text-xs font-medium text-muted">{subtitle}</p>
      </div>
      <div className="space-y-3">
        {items.map(({ company, price }) => (
          <CompanyCard
            key={company.id}
            company={company}
            price={price}
            layout="list"
            onSelect={() => onSelect(company, price)}
            distanceDetail={
              distanceMode && terminal
                ? formatTerminalDistanceDetail(company, terminal) ??
                  formatTerminalDistanceLabel(getTerminalDistanceKm(company, terminal), terminal)
                : undefined
            }
          />
        ))}
      </div>
    </section>
  );
}

export default function ComparePage({
  search,
  onSearchChange,
  companies,
  onBookOnAirpick,
}: {
  search: BookingSearch;
  onSearchChange: (s: BookingSearch) => void;
  companies: Company[];
  onBookOnAirpick: (company: Company, price: number) => void;
}) {
  const [sortMode, setSortMode] = useState<CompareSortMode>('price');
  const merged = mergeParkingCompareCompanies(companies);
  const { partners, externals } = buildParkingCompareSections(merged, search);
  const distancePartners = buildPartnerDistanceList(merged, search);
  const totalCount = partners.length + externals.length;

  const handleSelect = (company: Company, price: number) => {
    if (isAirpickPartner(company)) {
      onBookOnAirpick(company, price);
    } else {
      openExternalBooking(company);
    }
  };

  return (
    <div className="space-y-5">
      <div className="px-1">
        <h2 className="text-base font-bold text-ink">주차대행 비교</h2>
        <p className="text-xs font-medium text-muted">
          에어픽 입점 {partners.length}곳 · 비교 참고 {externals.length}곳
        </p>
      </div>

      <SearchPanel search={search} onChange={onSearchChange} onSubmit={() => {}} />

      {totalCount > 0 && <SortTabs mode={sortMode} onChange={setSortMode} />}

      {totalCount === 0 ? (
        <p className="rounded-2xl bg-sky-soft p-8 text-center text-sm text-muted shadow-[0_2px_8px_rgba(49,130,246,0.07)]">
          {search.isIndoor
            ? '실내 주차를 제공하는 업체가 없습니다.'
            : '야외 주차를 제공하는 업체가 없습니다.'}
        </p>
      ) : sortMode === 'price' ? (
        <>
          <CompareSection
            title="에어픽 입점 · 바로 예약"
            subtitle={`${partners.length}곳 · 낮은 가격순`}
            items={partners}
            onSelect={handleSelect}
          />

          <CompareSection
            title="가격 비교 · 홈페이지 이동"
            subtitle={`${externals.length}곳 · 낮은 가격순 · 신용카드 결제 시 업체별 +10%`}
            items={externals}
            onSelect={handleSelect}
          />
        </>
      ) : (
        <>
          {distancePartners.length === 0 ? (
            <p className="rounded-2xl bg-sky-soft p-8 text-center text-sm text-muted shadow-[0_2px_8px_rgba(49,130,246,0.07)]">
              거리순 비교는 에어픽 입점 업체만 제공합니다.
            </p>
          ) : (
            <CompareSection
              title="에어픽 입점 · 거리순"
              subtitle={terminalDistanceSubtitle(search, distancePartners.length)}
              items={distancePartners}
              onSelect={handleSelect}
              distanceMode
              terminal={search.terminal}
            />
          )}
          <p className="px-1 text-center text-[11px] font-medium text-muted">
            미입점 업체는 거리 정보를 제공하지 않습니다. 가격 비교는 가격순 탭에서 확인하세요.
          </p>
        </>
      )}
    </div>
  );
}

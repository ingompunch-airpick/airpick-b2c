import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import CompanyCard from '../components/CompanyCard';
import SearchPanel from '../components/SearchPanel';
import {
  AIRPICK_VERIFIED,
  PARKING_EXTERNAL_SECTION,
  PARKING_PARTNER_SECTION,
  parkingPartnerSectionTitle,
} from '../constants/marketing';
import { mergeParkingCompareCompanies, openExternalBooking } from '../lib/parkingCompare';
import {
  fetchReviewSnapshotsByCompanyIds,
  type CompanyReviewSnapshot,
} from '../lib/reviews';
import type { BookingSearch, Company, CompareSortMode } from '../types';
import {
  buildParkingCompareSections,
  buildPartnerRatingList,
  isAirpickPartner,
  type PricedCompany,
} from '../utils/compareSort';
import { companyValetFee } from '../utils/parkingType';
import { cn } from '../utils/cn';

function SortTabs({
  mode,
  onChange,
}: {
  mode: CompareSortMode;
  onChange: (mode: CompareSortMode) => void;
}) {
  const tabs: { id: CompareSortMode; label: string }[] = [
    { id: 'rating', label: '추천순' },
    { id: 'price', label: '가격순' },
  ];

  return (
    <div className="flex rounded-xl bg-neutral-50 p-1 shadow-[0_2px_8px_rgba(15,26,46,0.05)] ring-1 ring-[#0f1a2e]/8">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex-1 rounded-lg py-2 text-sm font-bold transition',
            mode === tab.id ? 'bg-white text-[#0f1a2e] shadow-sm' : 'text-muted hover:text-ink'
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
  terminal,
  reviewSnapshots,
  collapsible = false,
  defaultOpen = true,
  muted = false,
}: {
  title: string;
  subtitle: string;
  items: PricedCompany[];
  onSelect: (company: Company, price: number, soldOut: boolean) => void;
  terminal?: BookingSearch['terminal'];
  reviewSnapshots: Record<string, CompanyReviewSnapshot>;
  collapsible?: boolean;
  defaultOpen?: boolean;
  muted?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (items.length === 0) return null;

  const header = (
    <div className={cn('px-1', muted && 'opacity-80')}>
      <div className="flex items-center justify-between gap-2">
        <h3 className={cn('text-sm font-bold', muted ? 'text-muted' : 'text-ink')}>{title}</h3>
        {collapsible ? (
          <ChevronDown
            size={16}
            className={cn(
              'shrink-0 text-muted transition-transform',
              open && 'rotate-180'
            )}
            aria-hidden
          />
        ) : null}
      </div>
      <p className="text-xs font-medium text-muted">{subtitle}</p>
    </div>
  );

  const list = (
    <div className="space-y-3">
      {items.map(({ company, price, soldOut }) => (
        <CompanyCard
          key={company.id}
          company={company}
          price={price}
          layout="list"
          soldOut={soldOut === true}
          onSelect={() => onSelect(company, price, soldOut === true)}
          reviewSnapshot={reviewSnapshots[company.id]}
          valetFee={terminal ? companyValetFee(company, terminal) : null}
        />
      ))}
    </div>
  );

  if (collapsible) {
    return (
      <section className="space-y-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full rounded-xl bg-neutral-50 px-2 py-2.5 text-left ring-1 ring-[#0f1a2e]/10"
          aria-expanded={open}
        >
          {header}
        </button>
        {open ? list : null}
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {header}
      {list}
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
  const [sortMode, setSortMode] = useState<CompareSortMode>('rating');
  const [reviewSnapshots, setReviewSnapshots] = useState<Record<string, CompanyReviewSnapshot>>(
    {}
  );
  const merged = mergeParkingCompareCompanies(companies);
  const compareSearch = useMemo(() => ({ ...search, faceToFace: false as const }), [search]);
  const { partners, externals } = useMemo(
    () => buildParkingCompareSections(merged, compareSearch, reviewSnapshots),
    [merged, compareSearch, reviewSnapshots]
  );
  const totalCount = partners.length + externals.length;

  const partnerIds = useMemo(
    () => [...new Set(partners.map(({ company }) => company.id))],
    [partners]
  );

  const ratingPartners = useMemo(
    () => buildPartnerRatingList(merged, compareSearch, reviewSnapshots),
    [merged, compareSearch, reviewSnapshots]
  );

  useEffect(() => {
    let cancelled = false;
    if (partnerIds.length === 0) {
      setReviewSnapshots({});
      return;
    }
    void fetchReviewSnapshotsByCompanyIds(partnerIds).then((snapshots) => {
      if (!cancelled) setReviewSnapshots(snapshots);
    });
    return () => {
      cancelled = true;
    };
  }, [partnerIds.join('|')]);

  const handleSelect = (company: Company, price: number, soldOut: boolean) => {
    if (soldOut) return;
    if (isAirpickPartner(company)) {
      onBookOnAirpick(company, price);
    } else {
      openExternalBooking(company);
    }
  };

  return (
    <div className="space-y-5">
      <SearchPanel search={search} onChange={onSearchChange} />

      {totalCount > 0 && <SortTabs mode={sortMode} onChange={setSortMode} />}

      {totalCount === 0 ? (
        <div className="space-y-3 rounded-2xl bg-neutral-50 p-8 text-center text-sm text-muted shadow-[0_2px_8px_rgba(15,26,46,0.05)] ring-1 ring-[#0f1a2e]/8">
          <p>
            {search.isIndoor
              ? '실내 주차를 제공하는 업체가 없습니다.'
              : '야외 주차를 제공하는 업체가 없습니다.'}
          </p>
          <p className="text-xs">실내/야외를 바꿔 보거나, 일정을 조정해 주세요.</p>
        </div>
      ) : sortMode === 'price' ? (
        <>
          <CompareSection
            title={parkingPartnerSectionTitle(partners.length)}
            subtitle={PARKING_PARTNER_SECTION.subtitleNote}
            items={partners}
            onSelect={handleSelect}
            reviewSnapshots={reviewSnapshots}
            terminal={search.terminal}
          />

          <CompareSection
            title={PARKING_EXTERNAL_SECTION.title}
            subtitle={`${PARKING_EXTERNAL_SECTION.subtitleNote} · ${externals.length}곳`}
            items={externals}
            onSelect={handleSelect}
            reviewSnapshots={reviewSnapshots}
            terminal={search.terminal}
            collapsible
            defaultOpen={false}
            muted
          />
        </>
      ) : (
        <>
          {ratingPartners.length === 0 ? (
            <p className="rounded-2xl bg-neutral-50 p-8 text-center text-sm text-muted shadow-[0_2px_8px_rgba(15,26,46,0.05)] ring-1 ring-[#0f1a2e]/8">
              추천순은 {AIRPICK_VERIFIED.label} 파트너만 제공합니다.
            </p>
          ) : (
            <CompareSection
              title={parkingPartnerSectionTitle(ratingPartners.length)}
              subtitle={PARKING_PARTNER_SECTION.subtitleNote}
              items={ratingPartners}
              onSelect={handleSelect}
              reviewSnapshots={reviewSnapshots}
              terminal={search.terminal}
            />
          )}
          {externals.length > 0 ? (
            <p className="px-1 text-center text-[11px] font-medium text-muted">
              에어픽 미입점 · 시장 참고 가격은 가격순 탭에서 확인할 수 있어요.
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}

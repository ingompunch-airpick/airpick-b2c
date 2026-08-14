import { useEffect, useMemo, useState } from 'react';
import CompanyCard from '../components/CompanyCard';
import PageHero from '../components/PageHero';
import SearchPanel from '../components/SearchPanel';
import { PRICE_DISCLAIMER } from '../constants/complianceCopy';
import {
  PARKING_COMPARE_DESC,
  PARKING_COMPARE_H1,
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
  terminal,
  reviewSnapshots,
}: {
  title: string;
  subtitle: string;
  items: PricedCompany[];
  onSelect: (company: Company, price: number, soldOut: boolean) => void;
  terminal?: BookingSearch['terminal'];
  reviewSnapshots: Record<string, CompanyReviewSnapshot>;
}) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="px-1">
        <h3 className="text-sm font-bold text-ink">{title}</h3>
        <p className="text-xs font-medium text-muted">{subtitle}</p>
      </div>
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
  const { partners, externals } = buildParkingCompareSections(merged, compareSearch);
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
      <PageHero line={PARKING_COMPARE_H1} desc={PARKING_COMPARE_DESC} />
      <SearchPanel search={search} onChange={onSearchChange} />
      <p className="px-1 text-[11px] font-medium leading-relaxed text-muted">{PRICE_DISCLAIMER}</p>

      {totalCount > 0 && <SortTabs mode={sortMode} onChange={setSortMode} />}

      {totalCount === 0 ? (
        <div className="space-y-3 rounded-2xl bg-sky-soft p-8 text-center text-sm text-muted shadow-[0_2px_8px_rgba(49,130,246,0.07)]">
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
          />
        </>
      ) : (
        <>
          {ratingPartners.length === 0 ? (
            <p className="rounded-2xl bg-sky-soft p-8 text-center text-sm text-muted shadow-[0_2px_8px_rgba(49,130,246,0.07)]">
              추천순 비교는 에어픽 인증 업체만 제공합니다.
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
          <p className="px-1 text-center text-[11px] font-medium text-muted">
            미입점 업체는 평점을 제공하지 않습니다. 가격만 보려면 가격순 탭을 선택하세요.
          </p>
        </>
      )}
    </div>
  );
}

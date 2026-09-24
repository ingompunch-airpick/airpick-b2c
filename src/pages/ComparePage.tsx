import { useEffect, useMemo, useState } from 'react';
import CompanyCard from '../components/CompanyCard';
import SearchPanel from '../components/SearchPanel';
import SiteNoticeBanner from '../components/SiteNoticeBanner';
import { PARKING_PARTNER_SECTION, parkingPartnerSectionTitle } from '../constants/marketing';
import { listParkingCompareCompanies } from '../lib/parkingCompare';
import {
  fetchReviewSnapshotsByCompanyIds,
  type CompanyReviewSnapshot,
} from '../lib/reviews';
import type { BookingSearch, Company, CompareSortMode } from '../types';
import {
  buildPartnerPriceList,
  buildPartnerRatingList,
  type PricedCompany,
} from '../utils/compareSort';
import { useAffiliateOffer } from '../context/AffiliateContext';
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

function PartnerList({
  title,
  subtitle,
  items,
  onSelect,
  reviewSnapshots,
  affiliateDiscountWon = 0,
}: {
  title: string;
  subtitle: string;
  items: PricedCompany[];
  onSelect: (company: Company, price: number, soldOut: boolean) => void;
  reviewSnapshots: Record<string, CompanyReviewSnapshot>;
  affiliateDiscountWon?: number;
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
            affiliateDiscountWon={affiliateDiscountWon}
            onSelect={() => onSelect(company, price, soldOut === true)}
            reviewSnapshot={reviewSnapshots[company.id]}
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
  const { offer } = useAffiliateOffer();
  const affiliateDiscountWon = offer?.customerDiscountWon ?? 0;
  const partners = useMemo(() => listParkingCompareCompanies(companies), [companies]);
  const compareSearch = useMemo(() => ({ ...search, faceToFace: false as const }), [search]);

  const priceList = useMemo(
    () => buildPartnerPriceList(partners, compareSearch, reviewSnapshots, affiliateDiscountWon),
    [partners, compareSearch, reviewSnapshots, affiliateDiscountWon]
  );
  const ratingList = useMemo(
    () => buildPartnerRatingList(partners, compareSearch, reviewSnapshots, affiliateDiscountWon),
    [partners, compareSearch, reviewSnapshots, affiliateDiscountWon]
  );
  const list = sortMode === 'price' ? priceList : ratingList;
  const totalCount = list.length;

  const partnerIds = useMemo(
    () => [...new Set(partners.map((company) => company.id))],
    [partners]
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
    onBookOnAirpick(company, price);
  };

  return (
    <div className="space-y-5">
      <SiteNoticeBanner />
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
      ) : (
        <PartnerList
          title={parkingPartnerSectionTitle(list.length)}
          subtitle={PARKING_PARTNER_SECTION.subtitleNote}
          items={list}
          onSelect={handleSelect}
          reviewSnapshots={reviewSnapshots}
          affiliateDiscountWon={affiliateDiscountWon}
        />
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import CompanyCard from '../components/CompanyCard';
import PageHero from '../components/PageHero';
import SearchPanel from '../components/SearchPanel';
import { PRICE_DISCLAIMER, REVIEW_POLICY_LINE } from '../constants/complianceCopy';
import {
  HOME_TO_COMPARE_BADGE,
  PARKING_COMPARE_DESC,
  PARKING_COMPARE_GUIDE_LINKS,
  PARKING_COMPARE_H1,
  PARKING_EXTERNAL_SECTION,
  PARKING_PARTNER_SECTION,
  PARKING_PLATFORM_SUB,
} from '../constants/marketing';
import { mergeParkingCompareCompanies, openExternalBooking } from '../lib/parkingCompare';
import {
  fetchReviewSnapshotsByCompanyIds,
  type CompanyReviewSnapshot,
} from '../lib/reviews';
import type { BookingSearch, Company, CompareSortMode } from '../types';
import {
  buildParkingCompareSections,
  buildPartnerDistanceList,
  isAirpickPartner,
  sectionHasFaceToFace,
  type PricedCompany,
} from '../utils/compareSort';
import {
  formatTerminalDistanceDetail,
  formatTerminalDistanceLabel,
  getTerminalDistanceKm,
  terminalDistanceSubtitle,
} from '../utils/terminalDistance';
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
  isIndoor = true,
  reviewSnapshots,
  faceToFaceMode = false,
}: {
  title: string;
  subtitle: string;
  items: PricedCompany[];
  onSelect: (company: Company, price: number) => void;
  distanceMode?: boolean;
  terminal?: BookingSearch['terminal'];
  isIndoor?: boolean;
  reviewSnapshots: Record<string, CompanyReviewSnapshot>;
  faceToFaceMode?: boolean;
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
            reviewSnapshot={reviewSnapshots[company.id]}
            valetFee={terminal ? companyValetFee(company, terminal) : null}
            faceToFaceMode={faceToFaceMode}
            distanceDetail={
              distanceMode && terminal
                ? formatTerminalDistanceDetail(company, terminal, isIndoor) ??
                  formatTerminalDistanceLabel(
                    getTerminalDistanceKm(company, terminal, isIndoor),
                    terminal
                  )
                : undefined
            }
          />
        ))}
      </div>
    </section>
  );
}

function CompareGuideLinks() {
  return (
    <section className="rounded-2xl bg-sky-soft px-4 py-5 shadow-[0_2px_8px_rgba(49,130,246,0.07)]">
      <p className="text-xs font-bold text-brand">고르기 전에 · 가이드</p>
      <ul className="mt-2 space-y-1.5 text-xs font-semibold text-brand">
        {PARKING_COMPARE_GUIDE_LINKS.map(({ href, label }) => (
          <li key={href}>
            <a href={href} className="underline-offset-2 hover:underline">
              {label}
            </a>
          </li>
        ))}
        <li>
          <a href="/partners/" className="underline-offset-2 hover:underline">
            입점 업체 목록
          </a>
        </li>
      </ul>
    </section>
  );
}

export default function ComparePage({
  search,
  onSearchChange,
  companies,
  onBookOnAirpick,
  fromLeaveBy = false,
}: {
  search: BookingSearch;
  onSearchChange: (s: BookingSearch) => void;
  companies: Company[];
  onBookOnAirpick: (company: Company, price: number) => void;
  fromLeaveBy?: boolean;
}) {
  const [sortMode, setSortMode] = useState<CompareSortMode>('price');
  const [reviewSnapshots, setReviewSnapshots] = useState<Record<string, CompanyReviewSnapshot>>(
    {}
  );
  const [reviewsReady, setReviewsReady] = useState(false);
  const merged = mergeParkingCompareCompanies(companies);
  const { partners, externals } = buildParkingCompareSections(merged, search);
  const distancePartners = buildPartnerDistanceList(merged, search);
  const totalCount = partners.length + externals.length;

  /** 대면 UI는 입점 섹션에만 적용 (대면 가능 입점이 있을 때) */
  const partnerFaceToFace = !!search.faceToFace && sectionHasFaceToFace(partners, search.terminal);

  const partnerIds = useMemo(
    () => [...new Set([...partners, ...distancePartners].map(({ company }) => company.id))],
    [partners, distancePartners]
  );

  useEffect(() => {
    let cancelled = false;
    setReviewsReady(false);
    if (partnerIds.length === 0) {
      setReviewSnapshots({});
      setReviewsReady(true);
      return;
    }
    void fetchReviewSnapshotsByCompanyIds(partnerIds).then((snapshots) => {
      if (!cancelled) {
        setReviewSnapshots(snapshots);
        setReviewsReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [partnerIds.join('|')]);

  const totalPartnerReviews = useMemo(
    () => partnerIds.reduce((sum, id) => sum + (reviewSnapshots[id]?.count ?? 0), 0),
    [partnerIds, reviewSnapshots]
  );
  const showReviewEmptyNotice =
    partnerIds.length > 0 && reviewsReady && totalPartnerReviews === 0;

  const handleSelect = (company: Company, price: number) => {
    if (isAirpickPartner(company)) {
      onBookOnAirpick(company, price);
    } else {
      openExternalBooking(company);
    }
  };

  return (
    <div className="space-y-5">
      <PageHero sub={PARKING_PLATFORM_SUB} line={PARKING_COMPARE_H1} desc={PARKING_COMPARE_DESC} />
      {fromLeaveBy ? (
        <p className="rounded-xl bg-brand/10 px-3.5 py-2.5 text-[12px] font-bold text-brand ring-1 ring-brand/20">
          {HOME_TO_COMPARE_BADGE} · {search.terminal} · {search.departureDate.replace(/-/g, '.')}{' '}
          {search.departureTime}
        </p>
      ) : null}
      <SearchPanel search={search} onChange={onSearchChange} />
      <p className="px-1 text-[11px] font-medium leading-relaxed text-muted">{PRICE_DISCLAIMER}</p>

      {totalCount > 0 && <SortTabs mode={sortMode} onChange={setSortMode} />}

      {showReviewEmptyNotice && (
        <p className="rounded-xl bg-sky-soft px-4 py-3 text-center text-[11px] font-medium leading-relaxed text-muted ring-1 ring-sky-border/50">
          {REVIEW_POLICY_LINE}
        </p>
      )}

      {totalCount === 0 ? (
        <div className="space-y-3 rounded-2xl bg-sky-soft p-8 text-center text-sm text-muted shadow-[0_2px_8px_rgba(49,130,246,0.07)]">
          <p>
            {search.isIndoor
              ? '실내 주차를 제공하는 업체가 없습니다.'
              : '야외 주차를 제공하는 업체가 없습니다.'}
          </p>
          <p className="text-xs">실내/야외를 바꿔 보거나, 아래 가이드를 참고해 주세요.</p>
          <ul className="mx-auto max-w-xs space-y-1.5 text-left text-xs font-semibold text-brand">
            {PARKING_COMPARE_GUIDE_LINKS.map(({ href, label }) => (
              <li key={href}>
                <a href={href} className="underline-offset-2 hover:underline">
                  {label}
                </a>
              </li>
            ))}
            <li>
              <a href="/partners/" className="underline-offset-2 hover:underline">
                입점 업체 목록
              </a>
            </li>
          </ul>
        </div>
      ) : sortMode === 'price' ? (
        <>
          <CompareSection
            title={PARKING_PARTNER_SECTION.title}
            subtitle={
              partnerFaceToFace
                ? `${PARKING_PARTNER_SECTION.subtitleNote} · ${partners.length}곳 · 대면 가능 업체 우선 · 대면비 포함가`
                : `${PARKING_PARTNER_SECTION.subtitleNote} · ${partners.length}곳 · 낮은 가격순`
            }
            items={partners}
            onSelect={handleSelect}
            reviewSnapshots={reviewSnapshots}
            terminal={search.terminal}
            faceToFaceMode={partnerFaceToFace}
          />

          <CompareSection
            title={PARKING_EXTERNAL_SECTION.title}
            subtitle={`${PARKING_EXTERNAL_SECTION.subtitleNote} · ${externals.length}곳 · 낮은 가격순`}
            items={externals}
            onSelect={handleSelect}
            reviewSnapshots={reviewSnapshots}
            terminal={search.terminal}
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
              title={PARKING_PARTNER_SECTION.titleDistance}
              subtitle={`${PARKING_PARTNER_SECTION.subtitleNote} · ${terminalDistanceSubtitle(search, distancePartners.length)}`}
              items={distancePartners}
              onSelect={handleSelect}
              distanceMode
              terminal={search.terminal}
              isIndoor={search.isIndoor}
              reviewSnapshots={reviewSnapshots}
            />
          )}
          <p className="px-1 text-center text-[11px] font-medium text-muted">
            미입점 업체는 거리 정보를 제공하지 않습니다. 가격 비교는 가격순 탭에서 확인하세요.
          </p>
        </>
      )}

      <CompareGuideLinks />
    </div>
  );
}

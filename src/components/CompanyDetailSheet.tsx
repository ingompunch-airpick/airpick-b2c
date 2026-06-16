import { Star, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import TrustBadges from './TrustBadges';
import {
  fetchCompanyReviewSnapshot,
  formatReviewDate,
  type CompanyReviewSnapshot,
} from '../lib/reviews';
import type { BookingSearch, Company, CompanyReview } from '../types';
import { buildTelHref, formatPhoneDisplay } from '../utils/contact';
import { displayCompanyName } from '../utils/display';
import {
  companySupportsIndoor,
  companySupportsOutdoor,
  parkingTypeLabel,
} from '../utils/parkingType';
import {
  formatAddressWithTerminalDistance,
  formatTerminalDistanceDetail,
} from '../utils/terminalDistance';
import { formatParkingDistanceLotLabel } from '../utils/trustDisplay';
import { cn } from '../utils/cn';

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`별점 ${rating}점`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-sky-tint'
          )}
          strokeWidth={2}
        />
      ))}
    </div>
  );
}

function ReviewItem({ review }: { review: CompanyReview }) {
  return (
    <div className="rounded-xl bg-sky-bg px-3.5 py-3 ring-1 ring-sky-border/50">
      <div className="flex items-center justify-between gap-2">
        <StarRating rating={review.rating} size={12} />
        <span className="text-[10px] font-semibold text-muted-light">
          {formatReviewDate(review.createdAt)}
        </span>
      </div>
      <p className="mt-1.5 text-[11px] font-semibold text-muted">{review.authorMask}</p>
      {review.body?.trim() && (
        <p className="mt-1 text-sm leading-relaxed text-ink">{review.body.trim()}</p>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 text-sm">
      <span className="w-16 shrink-0 font-semibold text-muted">{label}</span>
      <span className="font-medium leading-snug text-ink">{value}</span>
    </div>
  );
}

export default function CompanyDetailSheet({
  company,
  price,
  search,
  onClose,
  onBook,
}: {
  company: Company;
  price: number;
  search: BookingSearch;
  onClose: () => void;
  onBook: () => void;
}) {
  const name = displayCompanyName(company.name);
  const [reviewSnapshot, setReviewSnapshot] = useState<CompanyReviewSnapshot | null>(null);

  useEffect(() => {
    let cancelled = false;
    setReviewSnapshot(null);
    void fetchCompanyReviewSnapshot(company.id).then((snapshot) => {
      if (!cancelled) setReviewSnapshot(snapshot);
    });
    return () => {
      cancelled = true;
    };
  }, [company.id]);

  const terminals =
    company.terminals?.length > 0 ? company.terminals.join(' · ') : 'T1 · T2';

  const parkingTypes = [
    companySupportsIndoor(company) && parkingTypeLabel(true),
    companySupportsOutdoor(company) && parkingTypeLabel(false),
  ]
    .filter(Boolean)
    .join(' · ');

  const telHref = buildTelHref(company.phone);
  const terminalDistance = formatTerminalDistanceDetail(company, search.terminal);

  const indoorAddress = company.indoorParkingAddress
    ? formatAddressWithTerminalDistance(company.indoorParkingAddress, company, search.terminal)
    : null;
  const outdoorAddress = company.outdoorParkingAddress
    ? formatAddressWithTerminalDistance(company.outdoorParkingAddress, company, search.terminal)
    : null;
  const parkingLotFromB2b = formatParkingDistanceLotLabel(company, search.terminal);
  const parkingLotLine =
    !indoorAddress && !outdoorAddress && parkingLotFromB2b
      ? formatAddressWithTerminalDistance(parkingLotFromB2b, company, search.terminal)
      : null;

  const reviewsLoading = reviewSnapshot == null;
  const reviews = reviewSnapshot?.recent ?? [];
  const reviewCount = reviewSnapshot?.count ?? 0;
  const reviewAverage = reviewSnapshot?.averageRating;

  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center bg-sky-deep/60 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-3xl bg-sky-soft shadow-xl sm:rounded-3xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-sky-border/50 px-5 py-4">
          <div className="flex min-w-0 gap-3">
            <img
              src={company.image_url}
              alt=""
              className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-2 ring-sky-tint"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-brand">에어픽 입점</p>
              <h2 className="text-lg font-bold text-ink">{name}</h2>
              {!reviewsLoading && reviewCount > 0 && reviewAverage != null && (
                <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-muted">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <span>{reviewAverage.toFixed(1)}</span>
                  <span>·</span>
                  <span>후기 {reviewCount}</span>
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full p-2 hover:bg-sky-tint"
            aria-label="닫기"
          >
            <X size={20} className="text-muted" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-muted">선택 일정 견적</p>
              <p className="mt-0.5 text-2xl font-bold tabular-nums text-brand">
                {price.toLocaleString()}원
              </p>
            </div>
            <p className="text-right text-[11px] font-semibold text-muted">
              {search.terminal} · {parkingTypeLabel(search.isIndoor)}
            </p>
          </div>

          <div className="mt-3">
            <TrustBadges company={company} size="md" />
          </div>

          <section className="mt-4 space-y-2 rounded-2xl bg-sky-bg p-4 ring-1 ring-sky-border/60">
            <p className="text-xs font-bold text-brand">업체 정보</p>
            <InfoRow label="터미널" value={terminals} />
            {parkingTypes && <InfoRow label="주차" value={parkingTypes} />}
            {terminalDistance && <InfoRow label="거리" value={terminalDistance} />}
            {telHref && (
              <div className="flex gap-3 text-sm">
                <span className="w-16 shrink-0 font-semibold text-muted">문의</span>
                <a href={telHref} className="font-bold text-brand">
                  {formatPhoneDisplay(company.phone!)}
                </a>
              </div>
            )}
            {indoorAddress && <InfoRow label="실내" value={indoorAddress} />}
            {outdoorAddress && <InfoRow label="야외" value={outdoorAddress} />}
            {parkingLotLine && <InfoRow label="주차장" value={parkingLotLine} />}
          </section>

          <section className="mt-4">
            <p className="text-xs font-bold text-brand">최근 후기</p>
            <div className="mt-2 space-y-2">
              {reviewsLoading ? (
                <p className="rounded-xl bg-sky-bg py-6 text-center text-xs font-medium text-muted">
                  후기 불러오는 중…
                </p>
              ) : reviews.length > 0 ? (
                reviews.map((review) => <ReviewItem key={review.id} review={review} />)
              ) : (
                <p className="rounded-xl bg-sky-bg px-4 py-6 text-center text-xs leading-relaxed text-muted ring-1 ring-sky-border/50">
                  아직 등록된 후기가 없습니다.
                  <br />
                  이용 후 MY에서 작성할 수 있습니다.
                </p>
              )}
            </div>
          </section>
        </div>

        <div className="shrink-0 border-t border-sky-border/50 bg-sky-soft px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onBook}
            className="w-full rounded-2xl bg-brand py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark active:scale-[0.99]"
          >
            {price.toLocaleString()}원 · 예약하기
          </button>
        </div>
      </div>
    </div>
  );
}

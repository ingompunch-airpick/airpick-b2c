import { MapPin, Star, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import InsuranceCoverageCard from './InsuranceCoverageCard';
import ParkingMapPinPreview from './ParkingMapPinPreview';
import {
  fetchCompanyReviewSnapshot,
  formatReviewDate,
  type CompanyReviewSnapshot,
} from '../lib/reviews';
import type { BookingSearch, Company, CompanyParkingLot, CompanyReview } from '../types';
import { listCompanyParkingLotsForDisplay } from '../utils/companyParking';
import { buildTelHref, formatPhoneDisplay } from '../utils/contact';
import { displayCompanyName } from '../utils/display';
import { companyPhotoUrl, companyThumbnailUrl } from '../utils/imageUrl';
import {
  companySupportsIndoor,
  companySupportsOutdoor,
  parkingTypeLabel,
} from '../utils/parkingType';
import { shouldShowInsuranceBadge } from '../utils/trustDisplay';
import { displayInsuranceLabel } from '../utils/trust';
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
  const identity = [review.authorMask, review.carMask].filter(Boolean).join(' · ');
  return (
    <div className="rounded-xl bg-sky-bg px-3.5 py-3 ring-1 ring-sky-border/50">
      <div className="flex items-center justify-between gap-2">
        <StarRating rating={review.rating} size={12} />
        <span className="text-[10px] font-semibold text-muted-light">
          {formatReviewDate(review.createdAt)}
        </span>
      </div>
      <p className="mt-1.5 text-[11px] font-semibold text-muted">{identity || '익명'}</p>
      {review.body?.trim() && (
        <p className="mt-1 text-sm leading-relaxed text-ink">{review.body.trim()}</p>
      )}
      {review.photoUrls?.length ? (
        <div className="mt-2 -mx-0.5 flex gap-2 overflow-x-auto px-0.5 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {review.photoUrls.map((url, index) => (
            <a
              key={`${url}_${index}`}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block shrink-0 overflow-hidden rounded-lg ring-1 ring-sky-border/60"
            >
              <img
                src={companyPhotoUrl(url, 320)}
                alt={`후기 사진 ${index + 1}`}
                width={112}
                height={112}
                className="h-28 w-28 object-cover"
                loading="lazy"
                decoding="async"
              />
            </a>
          ))}
        </div>
      ) : null}
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

function LotPhotoStrip({ photos }: { photos?: string[] }) {
  if (!photos?.length) return null;
  return (
    <div className="-mx-0.5 flex gap-2 overflow-x-auto px-0.5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {photos.map((url, index) => (
        <a
          key={`${url}_${index}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block shrink-0 overflow-hidden rounded-xl ring-1 ring-sky-border/60"
        >
          <img
            src={companyPhotoUrl(url, 320)}
            alt={`주차장 사진 ${index + 1}`}
            width={160}
            height={112}
            className="h-28 w-40 object-cover"
            loading="lazy"
            decoding="async"
          />
        </a>
      ))}
      {photos.length > 1 ? <div className="w-6 shrink-0" aria-hidden /> : null}
    </div>
  );
}

function ParkingLotCard({ lot }: { lot: CompanyParkingLot }) {
  const typeLabel = parkingTypeLabel(lot.type === 'indoor');
  const hasLocation =
    !!lot.parkingAddress?.trim() || (lot.lat != null && lot.lng != null) || !!lot.mapUrl;

  return (
    <div className="rounded-xl bg-white px-3.5 py-3 ring-1 ring-sky-border/60">
      <div className="flex items-start gap-2">
        <MapPin size={16} className="mt-0.5 shrink-0 text-brand" strokeWidth={2.25} />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-brand">
            {lot.name || `${typeLabel} 주차장`}
          </p>
          {lot.parkingAddress?.trim() ? (
            <p className="mt-0.5 text-sm font-semibold leading-snug text-ink">
              {lot.parkingAddress.trim()}
            </p>
          ) : (
            <p className="mt-0.5 text-xs font-medium text-muted">주소 미등록</p>
          )}
        </div>
      </div>
      {hasLocation ? (
        <div className="mt-2.5">
          <ParkingMapPinPreview
            address={lot.parkingAddress}
            mapUrl={lot.mapUrl}
            lat={lot.lat}
            lng={lot.lng}
          />
        </div>
      ) : null}
      {lot.photos?.length ? (
        <div className="mt-2.5">
          <p className="mb-1.5 text-[10px] font-bold text-muted">주차장 사진</p>
          <LotPhotoStrip photos={lot.photos} />
        </div>
      ) : null}
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

  useEffect(() => {
    if (!reviewSnapshot || reviewSnapshot.count <= 0 || reviewSnapshot.averageRating == null) {
      return;
    }

    const scriptId = `ld-company-review-${company.id}`;
    document.getElementById(scriptId)?.remove();

    const reviewsLd = reviewSnapshot.recent.map((review) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.authorMask || '익명',
      },
      datePublished: review.createdAt.slice(0, 10) || undefined,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      ...(review.body?.trim() ? { reviewBody: review.body.trim() } : {}),
    }));

    const payload = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name,
      url: 'https://www.에어픽.kr/parking',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: reviewSnapshot.averageRating,
        reviewCount: reviewSnapshot.count,
        bestRating: 5,
        worstRating: 1,
      },
      ...(reviewsLd.length > 0 ? { review: reviewsLd } : {}),
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = scriptId;
    script.text = JSON.stringify(payload);
    document.head.appendChild(script);

    return () => {
      document.getElementById(scriptId)?.remove();
    };
  }, [company.id, name, reviewSnapshot]);

  const terminals =
    company.terminals?.length > 0 ? company.terminals.join(' · ') : 'T1 · T2';

  const parkingTypes = [
    companySupportsIndoor(company) && parkingTypeLabel(true),
    companySupportsOutdoor(company) && parkingTypeLabel(false),
  ]
    .filter(Boolean)
    .join(' · ');

  const telHref = buildTelHref(company.phone);
  const parkingLots = listCompanyParkingLotsForDisplay(company, search.isIndoor);

  const reviewsLoading = reviewSnapshot == null;
  const reviews = reviewSnapshot?.recent ?? [];
  const reviewCount = reviewSnapshot?.count ?? 0;
  const reviewAverage = reviewSnapshot?.averageRating;
  const insuranceLabel = displayInsuranceLabel(company);
  const showInsuranceCard = shouldShowInsuranceBadge(company) && !!insuranceLabel;
  const certificateUrl = company.insurance?.certificateUrl?.trim() || undefined;

  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-sky-deep/50"
        aria-label="닫기"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-3xl bg-white shadow-xl sm:rounded-3xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-sky-border/50 px-5 py-4">
          <div className="flex min-w-0 gap-3">
            <img
              src={companyThumbnailUrl(company.image_url, 128)}
              alt={name}
              width={64}
              height={64}
              className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-2 ring-sky-tint"
              decoding="async"
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

          <section className="mt-4 space-y-2 rounded-2xl bg-sky-bg p-4 ring-1 ring-sky-border/60">
            <p className="text-xs font-bold text-brand">업체 정보</p>
            <InfoRow label="터미널" value={terminals} />
            {parkingTypes && <InfoRow label="주차" value={parkingTypes} />}
            {telHref && (
              <div className="flex gap-3 text-sm">
                <span className="w-16 shrink-0 font-semibold text-muted">문의</span>
                <a href={telHref} className="font-bold text-brand">
                  {formatPhoneDisplay(company.phone!)}
                </a>
              </div>
            )}
          </section>

          {showInsuranceCard && (
            <div className="mt-4">
              <InsuranceCoverageCard summary={insuranceLabel!} certificateUrl={certificateUrl} />
            </div>
          )}

          {parkingLots.length > 0 ? (
            <section className="mt-4 space-y-2">
              <p className="text-xs font-bold text-brand">주차장 위치</p>
              {parkingLots.map((lot) => (
                <ParkingLotCard key={lot.id} lot={lot} />
              ))}
            </section>
          ) : null}

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
                <div className="rounded-xl bg-sky-bg px-4 py-6 text-center text-xs leading-relaxed text-muted ring-1 ring-sky-border/50">
                  <p className="font-semibold text-ink">아직 등록된 후기가 없습니다</p>
                  <p className="mt-2">
                    에어픽은 이용 고객의 실후기만 표시합니다.
                    <br />
                    가짜 별점·시드 후기는 사용하지 않습니다.
                  </p>
                  <p className="mt-2">이용 후 예약 탭에서 후기를 남길 수 있습니다.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="shrink-0 border-t border-sky-border/50 bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
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

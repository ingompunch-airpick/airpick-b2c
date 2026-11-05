import { Car, Clock, KeyRound, MapPin, Phone, Shield, Star, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import AffiliatePrice from './AffiliatePrice';
import CompanyVerificationDocuments from './CompanyVerificationDocuments';
import ParkingMapPinPreview from './ParkingMapPinPreview';
import { pickupPin } from '../data/pickupPins';
import { trackOutboundClick } from '../lib/analytics';
import {
  fetchCompanyReviewSnapshot,
  SHOW_PUBLIC_REVIEW_DATES,
  formatReviewDate,
  type CompanyReviewSnapshot,
} from '../lib/reviews';
import type { BookingSearch, Company, CompanyParkingLot, CompanyReview } from '../types';
import { listCompanyParkingLotsForDisplay } from '../utils/companyParking';
import { buildTelHref, formatPhoneDisplay } from '../utils/contact';
import { formatStayPhrase } from '../utils/dates';
import { displayCompanyName } from '../utils/display';
import { companyPhotoUrl, companyThumbnailUrl } from '../utils/imageUrl';
import { companyCardPhotoUrl } from '../utils/parkingLocation';
import {
  companySupportsIndoor,
  companySupportsOutdoor,
  parkingTypeLabel,
} from '../utils/parkingType';
import { getParkingDayCount } from '../utils/pricing';
import { resolveCompanyUsageSteps } from '../utils/companyUsageGuide';
import { DEFAULT_CANCEL_CUTOFF_HOURS } from '../utils/reservationCancel';
import { displayInsuranceLabel } from '../utils/trust';
import { shouldShowInsuranceBadge } from '../utils/trustDisplay';
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
  const photos = (review.photoUrls ?? []).filter(Boolean).slice(0, 3);
  return (
    <div className="rounded-xl bg-white px-3.5 py-3 ring-1 ring-sky-border/50">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-ink">{identity || '익명'}</p>
              {SHOW_PUBLIC_REVIEW_DATES ? (
                <p className="mt-0.5 text-[10px] font-medium text-muted-light">
                  {formatReviewDate(review.createdAt)}
                </p>
              ) : null}
            </div>
            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-md bg-amber-500 px-1.5 py-0.5 text-[11px] font-bold text-white">
              <Star size={10} className="fill-white text-white" aria-hidden />
              {review.rating}
            </span>
          </div>
          <div className="mt-1.5">
            <StarRating rating={review.rating} size={11} />
          </div>
          {review.body?.trim() ? (
            <p className="mt-1.5 text-sm leading-relaxed text-ink">{review.body.trim()}</p>
          ) : null}
          <p className="mt-2 text-[10px] font-semibold text-muted">주차대행</p>
        </div>
        {photos.length > 0 ? (
          <div
            className={cn(
              'grid shrink-0 gap-1',
              photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
            )}
          >
            {photos.map((url, index) => (
              <a
                key={`${url}_${index}`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden rounded-lg ring-1 ring-sky-border/60"
              >
                <img
                  src={companyThumbnailUrl(url, 96)}
                  alt={`후기 사진 ${index + 1}`}
                  width={48}
                  height={48}
                  className="h-12 w-12 object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function FactIconRow({
  icon: Icon,
  title,
  detail,
}: {
  icon: typeof Car;
  title: string;
  detail?: string;
}) {
  return (
    <li className="flex gap-2.5">
      <Icon size={18} strokeWidth={2} className="mt-0.5 shrink-0 text-ink" aria-hidden />
      <span className="min-w-0">
        <span className="block text-[14px] font-semibold text-ink">{title}</span>
        {detail ? (
          <span className="mt-0.5 block text-[12px] font-medium leading-snug text-muted">{detail}</span>
        ) : null}
      </span>
    </li>
  );
}

function nightSurchargeLine(company: Company): string | null {
  const fee = company.surchargePrice;
  const start = company.surchargeStartTime?.trim();
  const end = company.surchargeEndTime?.trim();
  if (typeof fee !== 'number' || fee <= 0 || !start || !end) return null;
  return `${start}–${end} 입고·출고 시 ${fee.toLocaleString()}원`;
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
  affiliateDiscountWon = 0,
  onClose,
  onBook,
}: {
  company: Company;
  price: number;
  search: BookingSearch;
  /** 제휴 손님 할인(원) — 있으면 정상가 취소선 + 할인가 */
  affiliateDiscountWon?: number;
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
      ...(SHOW_PUBLIC_REVIEW_DATES && review.createdAt.slice(0, 10)
        ? { datePublished: review.createdAt.slice(0, 10) }
        : {}),
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
      url: 'https://www.에어픽.kr/',
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
  const usageSteps = resolveCompanyUsageSteps(company);

  const pickupId =
    search.isIndoor || search.pickupPointId === 'depart' || search.faceToFace
      ? 'depart'
      : 'short';
  const pin = pickupPin(search.terminal, pickupId);
  const meetHandoff = pin.meetHandoff;
  const transferTitle = meetHandoff ? '출국장에서 인계' : '단기주차장 입고';
  const keyTitle = meetHandoff ? '키를 맡깁니다' : '단기주차장에서 키를 맡깁니다';
  const lotLabel = parkingTypeLabel(search.isIndoor);
  const thumbSrc = companyThumbnailUrl(companyCardPhotoUrl(company, search.isIndoor), 128);
  const stay = formatStayPhrase(
    getParkingDayCount(search.departureDate, search.arrivalDate)
  );
  const nightLine = nightSurchargeLine(company);
  const insuranceLabel =
    shouldShowInsuranceBadge(company) ? displayInsuranceLabel(company) : undefined;

  const reviewsLoading = reviewSnapshot == null;
  const reviews = reviewSnapshot?.recent ?? [];
  const reviewCount = reviewSnapshot?.count ?? 0;
  const reviewAverage = reviewSnapshot?.averageRating;

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
            {thumbSrc ? (
            <img
              src={thumbSrc}
              alt={name}
              width={64}
              height={64}
              className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-2 ring-sky-tint"
              decoding="async"
            />
            ) : null}
            <div className="min-w-0">
              <p className="text-xs font-bold text-brand">에어픽 입점 · 주차대행</p>
              <h2 className="text-lg font-bold text-ink">{name}</h2>
              {!reviewsLoading && reviewCount > 0 && reviewAverage != null ? (
                <div className="mt-1 flex items-center gap-1.5 text-[12px] font-semibold text-muted">
                  <Star size={13} className="fill-amber-400 text-amber-400" aria-hidden />
                  <span className="tabular-nums text-ink">{reviewAverage.toFixed(1)}</span>
                  <span>·</span>
                  <span>후기 {reviewCount}</span>
                </div>
              ) : null}
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
          <section className="rounded-2xl bg-sky-bg p-4 ring-1 ring-sky-border/60">
            <p className="text-xs font-bold text-brand">이 상품</p>
            <ul className="mt-3 space-y-2.5">
              <FactIconRow icon={Car} title={transferTitle} detail={pin.detail} />
              <FactIconRow icon={KeyRound} title={keyTitle} />
              <FactIconRow
                icon={MapPin}
                title={`${lotLabel} · ${search.terminal}`}
                detail="현장 결제"
              />
              <FactIconRow
                icon={Clock}
                title={`입고 ${DEFAULT_CANCEL_CUTOFF_HOURS}시간 전까지 무료 취소`}
              />
              {nightLine ? (
                <FactIconRow icon={Clock} title="야간·새벽 할증" detail={nightLine} />
              ) : null}
              {insuranceLabel ? (
                <FactIconRow icon={Shield} title={insuranceLabel} detail="입점 확인 보험" />
              ) : null}
            </ul>
          </section>

          <section className="mt-4 space-y-3 rounded-2xl bg-sky-bg p-4 ring-1 ring-sky-border/60">
            <p className="text-xs font-bold text-brand">이용 방법</p>
            <ol className="space-y-3">
              {usageSteps.map((step, index) => (
                <li key={`${step.title}_${index}`} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-ink">{step.title}</p>
                    <p className="mt-0.5 text-[13px] font-medium leading-relaxed text-muted">
                      {step.body}
                    </p>
                    {step.mediaSrc ? (
                      <img
                        src={companyPhotoUrl(step.mediaSrc, 640)}
                        alt=""
                        width={320}
                        height={180}
                        className="mt-2 max-h-36 w-full rounded-xl object-cover ring-1 ring-sky-border/50"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
            {company.pickupLocation?.trim() &&
            !(company.usageSteps && company.usageSteps.length > 0) ? (
              <p className="text-[11px] font-medium leading-relaxed text-muted">
                기본 픽업지 · {company.pickupLocation.trim()}
              </p>
            ) : null}
          </section>

          <section className="mt-4 space-y-2 rounded-2xl bg-sky-bg p-4 ring-1 ring-sky-border/60">
            <p className="text-xs font-bold text-brand">업체 정보</p>
            <InfoRow label="터미널" value={terminals} />
            {parkingTypes ? <InfoRow label="주차" value={parkingTypes} /> : null}
            {telHref ? (
              <div className="flex items-center gap-3 text-sm">
                <span className="w-16 shrink-0 font-semibold text-muted">문의</span>
                <a
                  href={telHref}
                  className="inline-flex min-w-0 items-center gap-1.5 font-bold text-brand underline-offset-2 hover:underline"
                  onClick={() =>
                    trackOutboundClick({
                      category: 'phone',
                      destination: company.phone || '',
                      itemId: company.id,
                      itemName: name,
                    })
                  }
                >
                  <Phone size={14} strokeWidth={2.25} aria-hidden />
                  {formatPhoneDisplay(company.phone!)}
                </a>
              </div>
            ) : (
              <p className="text-xs font-medium leading-relaxed text-muted">
                업체 연락처가 아직 등록되지 않았습니다. 예약 후 안내되거나, 에어픽 고객센터로 문의해
                주세요.
              </p>
            )}
          </section>

          <div className="mt-4">
            <CompanyVerificationDocuments company={company} />
          </div>

          {parkingLots.length > 0 ? (
            <section className="mt-4 space-y-2">
              <p className="text-xs font-bold text-brand">주차장 위치</p>
              {parkingLots.map((lot) => (
                <ParkingLotCard key={lot.id} lot={lot} />
              ))}
            </section>
          ) : null}

          <section className="mt-4">
            <p className="text-xs font-bold text-brand">
              {reviewSnapshot && reviewSnapshot.count > 0
                ? `평점과 실후기 ${reviewSnapshot.count}건`
                : '실후기'}
            </p>
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

        <div className="shrink-0 border-t border-sky-border/50 bg-white px-5 py-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="mb-3 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-sky-bg px-2.5 py-1 text-[11px] font-bold text-ink ring-1 ring-sky-border/60">
              {transferTitle}
            </span>
            <span className="rounded-full bg-sky-bg px-2.5 py-1 text-[11px] font-bold text-ink ring-1 ring-sky-border/60">
              {lotLabel}
            </span>
            <span className="rounded-full bg-sky-bg px-2.5 py-1 text-[11px] font-bold text-ink ring-1 ring-sky-border/60">
              키 맡김
            </span>
          </div>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-muted">총 {stay} · 현장 결제</p>
              <AffiliatePrice
                price={price}
                affiliateDiscountWon={affiliateDiscountWon}
                size="lg"
                align="start"
                className="mt-0.5"
                priceClassName={
                  affiliateDiscountWon > 0
                    ? 'text-2xl font-bold text-muted-light'
                    : 'text-2xl font-bold text-ink'
                }
              />
            </div>
            {telHref ? (
              <a
                href={telHref}
                className="inline-flex shrink-0 items-center gap-1 rounded-xl px-2 py-2 text-[12px] font-bold text-brand"
                onClick={() =>
                  trackOutboundClick({
                    category: 'phone',
                    destination: company.phone || '',
                    itemId: company.id,
                    itemName: name,
                  })
                }
              >
                <Phone size={14} strokeWidth={2.25} aria-hidden />
                전화
              </a>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onBook}
            className="w-full rounded-2xl bg-[#0f1a2e] py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand active:scale-[0.99]"
          >
            예약하기
          </button>
        </div>
      </div>
    </div>
  );
}

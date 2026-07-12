import { Camera, ChevronRight, Headphones, MapPin, Phone, ShieldCheck, Star, XCircle } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { RESERVATION_STEPS, AIRPICK_TRACKING_UPSELL } from '../constants/marketing';
import NaverMapPreview from './NaverMapPreview';
import ReviewWriteModal from './ReviewWriteModal';
import type { Company, Reservation } from '../types';
import { displayCompanyName } from '../utils/display';
import { buildTelHref, formatPhoneDisplay } from '../utils/contact';
import { cn } from '../utils/cn';
import { resolveParkingLocationDisplay } from '../utils/parkingLocation';
import { parkingTypeLabel } from '../utils/parkingType';
import { INSURANCE_DISCLAIMER, resolveInsuranceDisplay } from '../utils/insurance';
import { getStatusLabel, getStatusStep } from '../utils/trust';
import { hasAirpickTrackingAccess } from '../utils/reservationSource';
import { getCancelEligibility } from '../utils/reservationCancel';
import { isReservationReviewable } from '../lib/reviews';

function formatSchedule(reservation: Reservation): string {
  const dep = reservation.departureDate.replace(/-/g, '.').slice(5);
  const arr = reservation.arrivalDate.replace(/-/g, '.').slice(5);
  const indoor = parkingTypeLabel(reservation.isIndoor);
  return `${dep} ${reservation.departureTime} → ${arr} ${reservation.arrivalTime} · ${reservation.departureTerminal} ${indoor}`;
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8) return phone;
  return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
}

function StatusTimeline({ status }: { status: string }) {
  const step = getStatusStep(status);
  if (step < 0) {
    return (
      <p className="text-xs font-semibold text-rose-500">{getStatusLabel(status)}</p>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex items-center">
        {RESERVATION_STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'h-2.5 w-2.5 rounded-full',
                  i <= step ? 'bg-brand' : 'bg-sky-tint ring-2 ring-sky-border'
                )}
              />
              <span
                className={cn(
                  'text-[9px] font-semibold',
                  i <= step ? 'text-brand' : 'text-muted-light'
                )}
              >
                {label}
              </span>
            </div>
            {i < RESERVATION_STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-0.5 mb-4 h-0.5 flex-1',
                  i < step ? 'bg-brand' : 'bg-sky-tint'
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TrustBlock({
  icon: Icon,
  title,
  children,
  highlight = false,
}: {
  icon: typeof MapPin;
  title: string;
  children: ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl p-4',
        highlight ? 'bg-brand/5 ring-1 ring-brand/15' : 'bg-sky-bg ring-1 ring-sky-border/60'
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-xl',
            highlight ? 'bg-brand/15' : 'bg-sky-tint'
          )}
        >
          <Icon size={16} className="text-brand" strokeWidth={2.25} />
        </div>
        <p className="text-sm font-bold text-ink">{title}</p>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function PhotoStrip({
  photos,
  emptyLabel,
  size = 'sm',
}: {
  photos?: string[];
  emptyLabel: string;
  size?: 'sm' | 'md';
}) {
  if (!photos?.length) {
    return (
      <p className="text-xs font-medium leading-relaxed text-muted">{emptyLabel}</p>
    );
  }

  const imgClass = size === 'md' ? 'h-24 w-32' : 'h-16 w-16';

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {photos.map((url) => (
        <a
          key={url}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block shrink-0 overflow-hidden rounded-xl ring-2 ring-sky-tint"
        >
          <img src={url} alt="" className={`${imgClass} object-cover`} loading="lazy" />
        </a>
      ))}
    </div>
  );
}

export default function ReservationCard({
  reservation,
  company,
  onBookAirpick,
  onCancel,
  onSubmitReview,
  lookupPassword = '',
}: {
  reservation: Reservation;
  company?: Company;
  onBookAirpick?: () => void;
  onCancel?: (password: string) => Promise<void>;
  onSubmitReview?: (password: string, rating: number, body: string) => Promise<void>;
  lookupPassword?: string;
}) {
  const statusLabel = getStatusLabel(reservation.status);
  const insuranceDisplay = resolveInsuranceDisplay(reservation, company);
  const trackingAccess = hasAirpickTrackingAccess(reservation);

  const checkInPhotos = reservation.checkInPhotos;
  const parkingDisplay = resolveParkingLocationDisplay(reservation, company);

  const cancelEligibility = getCancelEligibility(reservation, company);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelPw, setCancelPw] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);

  const canWriteReview =
    Boolean(onSubmitReview) &&
    isReservationReviewable(reservation.status) &&
    reservation.hasReview !== true;

  const handleCancel = async () => {
    if (!onCancel || !/^\d{4}$/.test(cancelPw)) return;
    setCancelLoading(true);
    setCancelError('');
    try {
      await onCancel(cancelPw);
      setCancelOpen(false);
      setCancelPw('');
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : '취소에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setCancelLoading(false);
    }
  };

  const locationPending =
    !parkingDisplay &&
    getStatusStep(reservation.status) < 1;

  return (
    <article className="rounded-3xl bg-sky-soft p-5 shadow-[0_2px_8px_rgba(49,130,246,0.07)]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="inline-flex rounded-full bg-brand/10 px-2.5 py-0.5 text-[11px] font-bold text-brand">
            {statusLabel}
          </span>
          <h3 className="mt-2 text-base font-bold text-ink">
            {displayCompanyName(reservation.companyName)}
          </h3>
          <p className="mt-0.5 text-xs font-medium text-muted">
            {reservation.carNumber} · {reservation.carModel}
          </p>
        </div>
        <p className="shrink-0 font-mono text-[10px] font-semibold text-muted-light">
          {reservation.id.replace('res_', '').slice(-8)}
        </p>
      </div>

      <p className="mt-2 text-xs font-medium text-muted">{formatSchedule(reservation)}</p>
      <p className="mt-1 text-lg font-bold text-brand tabular-nums">
        {reservation.totalPrice.toLocaleString()}원
      </p>

      <StatusTimeline status={reservation.status} />

      <div className="mt-4 space-y-2.5">
        {trackingAccess ? (
          <>
            <TrustBlock icon={MapPin} title="주차 위치" highlight>
              {parkingDisplay ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold leading-relaxed text-ink">{parkingDisplay.title}</p>
                    {parkingDisplay.detail && (
                      <p className="mt-0.5 text-xs font-medium text-muted">{parkingDisplay.detail}</p>
                    )}
                  </div>

                  <NaverMapPreview
                    address={parkingDisplay.title}
                    mapUrl={parkingDisplay.mapUrl}
                  />

                  <div>
                    <p className="mb-1.5 text-[11px] font-bold text-muted">위치 · 주차장 사진</p>
                    <PhotoStrip
                      photos={parkingDisplay.lotPhotos}
                      size="md"
                      emptyLabel="입구·주차장 사진이 등록되면 이곳에서 확인할 수 있습니다."
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs font-medium leading-relaxed text-muted">
                  {locationPending
                    ? '입고 후 주차장 위치가 등록되면 이곳에서 확인할 수 있습니다.'
                    : '주차 위치 정보를 준비 중입니다.'}
                </p>
              )}
            </TrustBlock>

            <TrustBlock icon={Camera} title="입고 사진">
              <PhotoStrip
                photos={checkInPhotos}
                emptyLabel="입고 후 기사가 촬영한 사진이 등록됩니다."
              />
            </TrustBlock>

            <TrustBlock icon={ShieldCheck} title="보험">
              {insuranceDisplay.status === 'unknown' ? (
                <p className="text-xs font-medium leading-relaxed text-muted">
                  업체 보험 가입 정보가 등록되면 이곳에서 확인할 수 있습니다.
                </p>
              ) : (
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-ink">{insuranceDisplay.summary}</p>
                  {insuranceDisplay.detail && (
                    <p className="text-xs font-medium text-muted">{insuranceDisplay.detail}</p>
                  )}
                  {insuranceDisplay.status === 'enrolled' && (
                    <p className="text-[10px] font-medium leading-relaxed text-muted-light">
                      {INSURANCE_DISCLAIMER}
                    </p>
                  )}
                </div>
              )}
            </TrustBlock>
          </>
        ) : (
          <div className="rounded-2xl bg-sky-bg p-4 ring-1 ring-sky-border/60">
            <p className="text-sm font-bold text-ink">{AIRPICK_TRACKING_UPSELL.title}</p>
            <p className="mt-1.5 text-xs font-medium leading-relaxed text-muted">
              {AIRPICK_TRACKING_UPSELL.body}
            </p>
            {onBookAirpick && (
              <button
                type="button"
                onClick={onBookAirpick}
                className="mt-3 w-full rounded-xl bg-brand py-2.5 text-xs font-bold text-white"
              >
                {AIRPICK_TRACKING_UPSELL.cta}
              </button>
            )}
          </div>
        )}

        <TrustBlock icon={Headphones} title="업체 문의">
          {buildTelHref(company?.phone) ? (
            <a
              href={buildTelHref(company?.phone)}
              className="flex items-center justify-center gap-2 rounded-xl bg-sky-tint py-3 text-xs font-bold text-brand ring-1 ring-sky-border/70 transition-colors hover:bg-sky-soft"
            >
              <Phone size={14} strokeWidth={2.25} />
              {displayCompanyName(reservation.companyName)} ·{' '}
              {formatPhoneDisplay(company!.phone!)}
            </a>
          ) : (
            <p className="text-xs font-medium leading-relaxed text-muted">
              업체 연락처가 등록되면 이곳에서 전화 문의할 수 있습니다.
            </p>
          )}
          <p className="mt-2 text-[10px] font-medium leading-relaxed text-muted-light">
            입·출고 시간, 차량 상태, 입고 후 변경·취소는 주차장(업체)으로 연락해 주세요.
          </p>
        </TrustBlock>
      </div>

      {reservation.hasReview === true && isReservationReviewable(reservation.status) && (
        <p className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-amber-50 py-2.5 text-xs font-bold text-amber-700 ring-1 ring-amber-100">
          <Star size={14} className="fill-amber-400 text-amber-400" strokeWidth={2} />
          후기 작성 완료
        </p>
      )}

      {canWriteReview && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setReviewOpen(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand py-2.5 text-xs font-bold text-white"
          >
            <Star size={14} strokeWidth={2.25} />
            후기 작성
          </button>
        </div>
      )}

      {reservation.status !== 'cancelled' && onCancel && cancelEligibility.cancellable && (
        <div className="mt-3">
          {!cancelOpen ? (
            <button
              type="button"
              onClick={() => setCancelOpen(true)}
              className="w-full rounded-xl bg-sky-bg py-2.5 text-xs font-bold text-muted ring-1 ring-sky-border/60 transition-colors hover:text-rose-500"
            >
              예약 취소
            </button>
          ) : (
            <div className="rounded-2xl bg-rose-50 p-4 ring-1 ring-rose-100">
              <div className="flex items-center gap-2">
                <XCircle size={16} className="text-rose-500" strokeWidth={2.25} />
                <p className="text-sm font-bold text-ink">예약을 취소할까요?</p>
              </div>
              <p className="mt-1.5 text-[11px] font-medium leading-relaxed text-muted">
                취소 후에는 되돌릴 수 없습니다. 예약 비밀번호 4자리를 입력해 주세요.
              </p>
              <input
                type="password"
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                value={cancelPw}
                onChange={(e) => setCancelPw(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="비밀번호 4자리"
                className="mt-3 w-full rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-sm font-semibold tracking-widest text-ink outline-none focus:border-rose-400"
              />
              {cancelError && (
                <p className="mt-2 text-[11px] font-semibold text-rose-600">{cancelError}</p>
              )}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCancelOpen(false);
                    setCancelPw('');
                    setCancelError('');
                  }}
                  className="flex-1 rounded-xl bg-white py-2.5 text-xs font-bold text-muted ring-1 ring-sky-border/70"
                >
                  닫기
                </button>
                <button
                  type="button"
                  disabled={cancelLoading || !/^\d{4}$/.test(cancelPw)}
                  onClick={handleCancel}
                  className="flex-1 rounded-xl bg-rose-500 py-2.5 text-xs font-bold text-white transition-colors hover:bg-rose-600 disabled:opacity-60"
                >
                  {cancelLoading ? '취소 중…' : '예약 취소 확정'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <details className="mt-4 rounded-2xl bg-sky-bg px-4 py-3 ring-1 ring-sky-border/60">
        <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-bold text-muted">
          예약 상세
          <ChevronRight size={16} className="text-muted-light" />
        </summary>
        <dl className="mt-3 space-y-2 text-xs">
          <div className="flex justify-between gap-4">
            <dt className="font-semibold text-muted">예약자</dt>
            <dd className="font-semibold text-ink">{reservation.userName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="font-semibold text-muted">연락처</dt>
            <dd className="font-semibold text-ink">{maskPhone(reservation.phone)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="font-semibold text-muted">결제</dt>
            <dd className="font-semibold text-ink">
              {reservation.paymentMethod === 'unpaid' ? '현장 결제' : reservation.paymentMethod}
            </dd>
          </div>
        </dl>
      </details>

      {reviewOpen && onSubmitReview && (
        <ReviewWriteModal
          companyName={displayCompanyName(reservation.companyName)}
          initialPassword={lookupPassword}
          onClose={() => setReviewOpen(false)}
          onSubmit={async (password, rating, body) => {
            await onSubmitReview(password, rating, body);
            setReviewOpen(false);
          }}
        />
      )}
    </article>
  );
}

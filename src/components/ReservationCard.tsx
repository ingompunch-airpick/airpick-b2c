import { Camera, ChevronRight, ExternalLink, MapPin, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { RESERVATION_STEPS } from '../constants/marketing';
import type { Company, Reservation } from '../types';
import { displayCompanyName } from '../utils/display';
import { cn } from '../utils/cn';
import { resolveParkingLocationDisplay } from '../utils/parkingLocation';
import { getStatusLabel, getStatusStep } from '../utils/trust';

function formatSchedule(reservation: Reservation): string {
  const dep = reservation.departureDate.replace(/-/g, '.').slice(5);
  const arr = reservation.arrivalDate.replace(/-/g, '.').slice(5);
  const indoor = reservation.isIndoor ? '실내' : '실외';
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

function PhotoStrip({ photos, emptyLabel }: { photos?: string[]; emptyLabel: string }) {
  if (!photos?.length) {
    return (
      <p className="text-xs font-medium leading-relaxed text-muted">{emptyLabel}</p>
    );
  }

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
          <img src={url} alt="" className="h-16 w-16 object-cover" loading="lazy" />
        </a>
      ))}
    </div>
  );
}

export default function ReservationCard({
  reservation,
  company,
}: {
  reservation: Reservation;
  company?: Company;
}) {
  const statusLabel = getStatusLabel(reservation.status);
  const insuranceText = reservation.insuranceProvider
    ? `${reservation.insuranceProvider}${
        reservation.insuranceLimit
          ? ` · 보장 ${Math.round(reservation.insuranceLimit / 10000)}천만원`
          : ''
      }`
    : null;

  const checkInPhotos = reservation.checkInPhotos;
  const parkingDisplay = resolveParkingLocationDisplay(reservation, company);

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
        <TrustBlock icon={MapPin} title="주차 위치" highlight>
          {parkingDisplay ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold leading-relaxed text-ink">{parkingDisplay.title}</p>
              {parkingDisplay.detail && (
                <p className="text-xs font-medium text-muted">{parkingDisplay.detail}</p>
              )}
              {parkingDisplay.mapUrl && (
                <a
                  href={parkingDisplay.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand"
                >
                  지도에서 보기
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          ) : (
            <p className="text-xs font-medium leading-relaxed text-muted">
              {locationPending
                ? '입고 후 주차장 위치가 등록되면 이곳에서 확인할 수 있습니다.'
                : '주차 위치 정보를 준비 중입니다.'}
            </p>
          )}
        </TrustBlock>

        <TrustBlock icon={Camera} title="입·출고 사진">
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-[11px] font-bold text-muted">입고</p>
              <PhotoStrip
                photos={checkInPhotos}
                emptyLabel="입고 후 기사가 촬영한 사진이 등록됩니다."
              />
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-bold text-muted">출고</p>
              <PhotoStrip
                photos={reservation.checkOutPhotos}
                emptyLabel={
                  getStatusStep(reservation.status) >= 3
                    ? '출고 사진을 준비 중입니다.'
                    : '출고 시 촬영된 사진이 등록됩니다.'
                }
              />
            </div>
          </div>
        </TrustBlock>

        <TrustBlock icon={ShieldCheck} title="보험">
          {insuranceText ? (
            <p className="text-sm font-semibold text-ink">{insuranceText}</p>
          ) : (
            <p className="text-xs font-medium leading-relaxed text-muted">
              업체 보험 가입 정보가 등록되면 이곳에서 확인할 수 있습니다.
            </p>
          )}
        </TrustBlock>
      </div>

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
    </article>
  );
}

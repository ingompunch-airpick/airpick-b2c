import { ChevronRight, ExternalLink, Star } from 'lucide-react';
import { PARKING_EXTERNAL_SECTION } from '../constants/marketing';
import type { CompanyReviewSnapshot } from '../lib/reviews';
import type { Company } from '../types';
import { cn } from '../utils/cn';
import { isAirpickPartner } from '../utils/compareSort';
import { displayCompanyName } from '../utils/display';
import { companyThumbnailUrl } from '../utils/imageUrl';
import TrustBadges from './TrustBadges';

export default function CompanyCard({
  company,
  price,
  onSelect,
  layout = 'grid',
  reviewSnapshot,
  valetFee = null,
  soldOut = false,
}: {
  company: Company;
  price: number;
  onSelect: () => void;
  layout?: 'grid' | 'list';
  /** reviews 컬렉션 기준 — 없으면 후기 미표시 */
  reviewSnapshot?: CompanyReviewSnapshot;
  /** 선택 터미널 발렛비 — null이면 발렛 미제공 (미입점 안내용) */
  valetFee?: number | null;
  /** 검색 일정 기준 만차·마감 — 흐리게 표시, 선택 불가 */
  soldOut?: boolean;
}) {
  const name = displayCompanyName(company.name);
  const partner = isAirpickPartner(company);
  const thumbSrc = companyThumbnailUrl(company.image_url, 128);

  if (layout === 'grid') {
    return (
      <button
        type="button"
        onClick={soldOut ? undefined : onSelect}
        disabled={soldOut}
        aria-disabled={soldOut}
        className={cn(
          'relative flex flex-col items-center gap-2 rounded-2xl bg-sky-soft p-3 text-center shadow-[0_2px_8px_rgba(49,130,246,0.07)] transition',
          soldOut ? 'cursor-not-allowed' : 'hover:bg-sky-tint'
        )}
      >
        <div className={cn('contents', soldOut && 'pointer-events-none opacity-40')}>
          <div className="h-14 w-14 overflow-hidden rounded-full bg-sky-tint">
            <img
              src={thumbSrc}
              alt={name}
              width={56}
              height={56}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
          <span className="line-clamp-1 text-xs font-bold text-ink">{name}</span>
          <span className="text-sm font-bold text-brand tabular-nums">
            {price.toLocaleString()}원
          </span>
        </div>
        {soldOut ? (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-sky-bg/55">
            <span className="rounded-lg bg-ink/80 px-2.5 py-1 text-sm font-black tracking-wide text-white shadow-sm">
              만차
            </span>
          </span>
        ) : null}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={soldOut ? undefined : onSelect}
      disabled={soldOut}
      aria-disabled={soldOut}
      className={cn(
        'relative flex w-full items-center gap-3 overflow-hidden rounded-2xl bg-sky-soft p-4 text-left shadow-[0_2px_8px_rgba(49,130,246,0.07)] transition',
        soldOut ? 'cursor-not-allowed' : 'hover:bg-sky-tint'
      )}
    >
      <div
        className={cn(
          'flex min-w-0 flex-1 items-center gap-3',
          soldOut && 'pointer-events-none opacity-40'
        )}
      >
        <img
          src={thumbSrc}
          alt={name}
          width={64}
          height={64}
          className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-2 ring-sky-tint"
          loading="lazy"
          decoding="async"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate text-base font-bold text-ink">{name}</p>
            {partner ? (
              <span className="shrink-0 rounded-md bg-brand/10 px-1.5 py-0.5 text-[10px] font-bold text-brand">
                VERIFIED
              </span>
            ) : (
              <span className="shrink-0 rounded-md bg-sky-tint px-1.5 py-0.5 text-[10px] font-bold text-muted">
                미입점 · 참고
              </span>
            )}
          </div>
          {partner && reviewSnapshot && reviewSnapshot.count > 0 && reviewSnapshot.averageRating != null ? (
            <div className="mt-2 flex items-end justify-between gap-3">
              <div className="flex min-w-0 items-baseline gap-1.5">
                <Star size={16} className="shrink-0 fill-amber-400 text-amber-400" />
                <span className="text-lg font-bold tabular-nums text-ink">
                  {reviewSnapshot.averageRating.toFixed(1)}
                </span>
                <span className="text-[11px] font-medium text-muted">
                  실후기 {reviewSnapshot.count}
                </span>
              </div>
              <p className="shrink-0 text-lg font-bold tabular-nums text-brand">
                {price.toLocaleString()}원
              </p>
            </div>
          ) : partner ? (
            <p className="mt-2 text-lg font-bold tabular-nums text-brand">
              {price.toLocaleString()}원
            </p>
          ) : (
            <>
              <p className="mt-1 text-[11px] font-medium leading-snug text-muted">
                {PARKING_EXTERNAL_SECTION.cardNote}
              </p>
              <p className="mt-2 text-lg font-bold text-brand tabular-nums">
                {price.toLocaleString()}원
              </p>
            </>
          )}
          {partner && (
            <div className="mt-2">
              <TrustBadges company={company} />
            </div>
          )}
          {!partner && valetFee != null && valetFee > 0 && (
            <p className="mt-0.5 text-[11px] font-medium text-muted">
              발렛비 +{valetFee.toLocaleString()}원 포함
            </p>
          )}
        </div>
        {partner ? (
          <ChevronRight size={20} className={cn('shrink-0 text-muted-light')} />
        ) : (
          <ExternalLink size={18} className={cn('shrink-0 text-muted-light')} />
        )}
      </div>

      {soldOut ? (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-sky-bg/55">
          <span className="rounded-xl bg-ink/85 px-4 py-2 text-lg font-black tracking-wider text-white shadow-md ring-1 ring-white/20">
            만차
          </span>
        </span>
      ) : null}
    </button>
  );
}

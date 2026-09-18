import { Star } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import type { CompanyReviewSnapshot } from '../lib/reviews';
import type { Company } from '../types';
import { cn } from '../utils/cn';
import { displayCompanyName } from '../utils/display';
import { companyThumbnailUrl } from '../utils/imageUrl';
import AffiliatePrice from './AffiliatePrice';
import TrustBadges from './TrustBadges';

export default function CompanyCard({
  company,
  price,
  onSelect,
  layout = 'grid',
  reviewSnapshot,
  soldOut = false,
  affiliateDiscountWon = 0,
}: {
  company: Company;
  price: number;
  onSelect: () => void;
  layout?: 'grid' | 'list';
  /** reviews 컬렉션 기준 — 없으면 후기 미표시 */
  reviewSnapshot?: CompanyReviewSnapshot;
  /** 검색 일정 기준 만차·마감 — 흐리게 표시, 선택 불가 */
  soldOut?: boolean;
  /** 제휴 링크 손님 할인(원) — 있으면 정상가 취소선 + 할인가 */
  affiliateDiscountWon?: number;
}) {
  const name = displayCompanyName(company.name);
  const thumbSrc = companyThumbnailUrl(company.image_url, 128);

  if (layout === 'grid') {
    return (
      <button
        type="button"
        onClick={soldOut ? undefined : onSelect}
        disabled={soldOut}
        aria-disabled={soldOut}
        className={cn(
          'relative flex flex-col items-center gap-2 rounded-2xl bg-neutral-50 p-3 text-center shadow-[0_2px_8px_rgba(15,26,46,0.05)] ring-1 ring-[#0f1a2e]/8 transition',
          soldOut ? 'cursor-not-allowed' : 'hover:bg-[#0f1a2e]/[0.04]'
        )}
      >
        <div className={cn('contents', soldOut && 'pointer-events-none opacity-40')}>
          <div className="h-14 w-14 overflow-hidden rounded-full bg-[#0f1a2e]/[0.06]">
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
          <AffiliatePrice
            price={price}
            affiliateDiscountWon={affiliateDiscountWon}
            size="sm"
            align="center"
          />
        </div>
        {soldOut ? (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-white/70">
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
        'relative flex w-full items-center gap-3 overflow-hidden rounded-2xl bg-neutral-50 p-4 text-left shadow-[0_2px_8px_rgba(15,26,46,0.05)] ring-1 ring-[#0f1a2e]/8 transition',
        soldOut ? 'cursor-not-allowed' : 'hover:bg-[#0f1a2e]/[0.04]'
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
          className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-2 ring-[#0f1a2e]/10"
          loading="lazy"
          decoding="async"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-ink">{name}</p>
          {reviewSnapshot && reviewSnapshot.count > 0 && reviewSnapshot.averageRating != null ? (
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
              <AffiliatePrice
                price={price}
                affiliateDiscountWon={affiliateDiscountWon}
                size="lg"
                align="end"
              />
            </div>
          ) : (
            <div className="mt-2 flex justify-end">
              <AffiliatePrice
                price={price}
                affiliateDiscountWon={affiliateDiscountWon}
                size="lg"
                align="end"
              />
            </div>
          )}
          <div className="mt-2">
            <TrustBadges company={company} />
          </div>
        </div>
        <ChevronRight size={20} className="shrink-0 text-muted-light" />
      </div>

      {soldOut ? (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/70">
          <span className="rounded-xl bg-ink/85 px-4 py-2 text-lg font-black tracking-wider text-white shadow-md ring-1 ring-white/20">
            만차
          </span>
        </span>
      ) : null}
    </button>
  );
}

import { ChevronRight, ExternalLink, Star } from 'lucide-react';
import type { CompanyReviewSnapshot } from '../lib/reviews';
import type { Company } from '../types';
import { cn } from '../utils/cn';
import { isAirpickPartner } from '../utils/compareSort';
import { displayCompanyName } from '../utils/display';
import TrustBadges from './TrustBadges';

export default function CompanyCard({
  company,
  price,
  onSelect,
  layout = 'grid',
  distanceDetail,
  reviewSnapshot,
}: {
  company: Company;
  price: number;
  onSelect: () => void;
  layout?: 'grid' | 'list';
  /** 거리순 탭에서 터미널까지 거리 표시 */
  distanceDetail?: string;
  /** reviews 컬렉션 기준 — 없으면 후기 미표시 */
  reviewSnapshot?: CompanyReviewSnapshot;
}) {
  const name = displayCompanyName(company.name);
  const partner = isAirpickPartner(company);

  if (layout === 'grid') {
    return (
      <button
        type="button"
        onClick={onSelect}
        className="flex flex-col items-center gap-2 rounded-2xl bg-sky-soft p-3 text-center shadow-[0_2px_8px_rgba(49,130,246,0.07)] transition hover:bg-sky-tint"
      >
        <div className="h-14 w-14 overflow-hidden rounded-full bg-sky-tint">
          <img
            src={company.image_url}
            alt={name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <span className="line-clamp-1 text-xs font-bold text-ink">{name}</span>
        <span className="text-sm font-bold text-brand tabular-nums">
          {price.toLocaleString()}원
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-3 rounded-2xl bg-sky-soft p-4 text-left shadow-[0_2px_8px_rgba(49,130,246,0.07)] transition hover:bg-sky-tint"
    >
      <img
        src={company.image_url}
        alt={name}
        className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-2 ring-sky-tint"
        loading="lazy"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-base font-bold text-ink">{name}</p>
          {partner ? (
            <span className="shrink-0 rounded-md bg-brand/10 px-1.5 py-0.5 text-[10px] font-bold text-brand">
              에어픽 예약
            </span>
          ) : (
            <span className="shrink-0 rounded-md bg-sky-tint px-1.5 py-0.5 text-[10px] font-bold text-muted">
              홈페이지
            </span>
          )}
        </div>
        {partner && reviewSnapshot && reviewSnapshot.count > 0 && reviewSnapshot.averageRating != null && (
          <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-muted">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span>{reviewSnapshot.averageRating.toFixed(1)}</span>
            <span>·</span>
            <span>후기 {reviewSnapshot.count}</span>
          </div>
        )}
        {partner && (
          <div className="mt-2">
            <TrustBadges company={company} />
          </div>
        )}
        {distanceDetail && (
          <p className="mt-2 text-[11px] font-semibold text-brand">{distanceDetail}</p>
        )}
        <p className={cn('text-lg font-bold text-brand tabular-nums', distanceDetail ? 'mt-1' : 'mt-2')}>
          {price.toLocaleString()}원
        </p>
        <p className="mt-1 text-[11px] font-semibold text-muted">
          {partner ? '업체 보기 · 예약' : '업체 홈페이지에서 예약'}
        </p>
      </div>
      {partner ? (
        <ChevronRight size={20} className={cn('shrink-0 text-muted-light')} />
      ) : (
        <ExternalLink size={18} className={cn('shrink-0 text-muted-light')} />
      )}
    </button>
  );
}

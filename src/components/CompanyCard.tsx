import { ChevronRight, Star } from 'lucide-react';
import type { Company } from '../types';
import { cn } from '../utils/cn';
import { displayCompanyName } from '../utils/display';

export default function CompanyCard({
  company,
  price,
  onSelect,
  layout = 'grid',
}: {
  company: Company;
  price: number;
  onSelect: () => void;
  layout?: 'grid' | 'list';
}) {
  const name = displayCompanyName(company.name);

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
        <p className="truncate text-base font-bold text-ink">{name}</p>
        <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-muted">
          <Star size={12} className="fill-amber-400 text-amber-400" />
          <span>{company.rating.toFixed(1)}</span>
          <span>·</span>
          <span>후기 {company.reviews_count}</span>
        </div>
        <p className="mt-1 text-lg font-bold text-brand tabular-nums">
          {price.toLocaleString()}원
        </p>
      </div>
      <ChevronRight size={20} className={cn('shrink-0 text-muted-light')} />
    </button>
  );
}

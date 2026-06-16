import { ExternalLink } from 'lucide-react';
import type { EsimProduct } from '../types';
import { cn } from '../utils/cn';
import { formatEsimDataPlan, formatEsimSimType, formatEsimSpeed } from '../utils/esimLabels';

export default function EsimProductCard({
  product,
  onSelect,
  rank,
}: {
  product: EsimProduct;
  onSelect: () => void;
  /** 가격순 순위 (1부터) */
  rank?: number;
}) {
  const hasLink = !!product.partnerUrl?.trim();

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-3 rounded-2xl bg-sky-soft p-4 text-left shadow-[0_2px_8px_rgba(49,130,246,0.07)] transition hover:bg-sky-tint"
    >
      {rank != null && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-tint text-xs font-bold text-brand">
          {rank}
        </div>
      )}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-tint text-xs font-bold text-brand">
        {product.countryCode}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-base font-bold text-ink">{product.partnerName}</p>
          <span className="shrink-0 rounded-md bg-sky-deep px-1.5 py-0.5 text-[10px] font-semibold text-brand">
            {formatEsimSimType(product.type)}
          </span>
        </div>
        <p className="mt-0.5 text-xs font-medium text-muted">
          {formatEsimDataPlan(product.dataPlan)} · {formatEsimSpeed(product.speed)} ·{' '}
          {product.days}일
        </p>
        <p className="mt-1 text-lg font-bold text-brand tabular-nums">
          {product.price.toLocaleString()}원
          <span className="ml-1 text-[11px] font-semibold text-muted">참고가</span>
        </p>
      </div>
      <ExternalLink
        size={18}
        className={cn('shrink-0', hasLink ? 'text-brand' : 'text-muted-light')}
      />
    </button>
  );
}

import { ExternalLink } from 'lucide-react';
import type { EsimProduct } from '../types';
import { cn } from '../utils/cn';

export default function EsimProductCard({
  product,
  onSelect,
  rank,
}: {
  product: EsimProduct;
  onSelect: () => void;
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
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-bold text-ink">{product.partnerName}</p>
        {product.description ? (
          <p className="mt-0.5 line-clamp-2 text-xs font-medium text-muted">{product.description}</p>
        ) : null}
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

import { ExternalLink } from 'lucide-react';
import type { EsimProduct } from '../types';
import { cn } from '../utils/cn';
import { formatEsimSpeed } from '../utils/esimLabels';

export default function EsimProductCard({
  product,
  onSelect,
  rank,
  compact,
}: {
  product: EsimProduct;
  onSelect: () => void;
  rank?: number;
  compact?: boolean;
}) {
  const hasLink = !!product.partnerUrl?.trim();

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-3 rounded-2xl bg-sky-soft text-left shadow-[0_2px_8px_rgba(49,130,246,0.07)] transition hover:bg-sky-tint',
        compact ? 'p-3' : 'p-4'
      )}
    >
      {rank != null && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-tint text-xs font-bold text-brand">
          {rank}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-bold text-ink">{product.partnerName}</p>
        <p className="mt-0.5 text-xs font-medium text-muted">
          {formatEsimSpeed(product.speed)}
          {product.description ? ` · ${product.description}` : ''}
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

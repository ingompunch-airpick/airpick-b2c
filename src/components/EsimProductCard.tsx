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
      className="flex w-full items-center gap-3 rounded-2xl bg-neutral-50 p-4 text-left shadow-[0_2px_8px_rgba(15,26,46,0.05)] ring-1 ring-[#0f1a2e]/8 transition hover:bg-[#0f1a2e]/[0.04]"
    >
      {rank != null && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0f1a2e]/[0.06] text-xs font-bold text-[#0f1a2e]">
          {rank}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-bold text-ink">{product.partnerName}</p>
        {product.description ? (
          <p className="mt-0.5 line-clamp-2 text-xs font-medium text-muted">{product.description}</p>
        ) : null}
        <p className="mt-1 text-lg font-bold text-[#0f1a2e] tabular-nums">
          {product.price > 0 ? (
            <>
              {product.price.toLocaleString()}원
              <span className="ml-1 text-[11px] font-semibold text-muted">참고가</span>
            </>
          ) : (
            <span className="text-base text-muted">가격 미입력</span>
          )}
        </p>
      </div>
      <ExternalLink
        size={18}
        className={cn('shrink-0', hasLink ? 'text-[#0f1a2e]' : 'text-muted-light')}
      />
    </button>
  );
}

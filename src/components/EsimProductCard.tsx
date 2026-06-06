import { ChevronRight } from 'lucide-react';
import type { EsimProduct } from '../types';

export default function EsimProductCard({
  product,
  onSelect,
}: {
  product: EsimProduct;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-3 rounded-2xl bg-sky-soft p-4 text-left shadow-[0_2px_8px_rgba(49,130,246,0.07)] transition hover:bg-sky-tint"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-tint text-xs font-bold text-brand">
        {product.regionCode}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-base font-bold text-ink">{product.name}</p>
          <span className="shrink-0 rounded-md bg-sky-deep px-1.5 py-0.5 text-[10px] font-semibold text-brand">
            {product.type === 'esim' ? 'eSIM' : '유심'}
          </span>
        </div>
        <p className="mt-0.5 text-xs font-medium text-muted">
          {product.dataLabel} · {product.days}일
        </p>
        <p className="mt-1 text-lg font-bold text-brand tabular-nums">
          {product.price.toLocaleString()}원
        </p>
      </div>
      <ChevronRight size={20} className="shrink-0 text-muted-light" />
    </button>
  );
}

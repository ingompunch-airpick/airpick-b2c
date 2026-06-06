import { useState } from 'react';
import EsimProductCard from '../components/EsimProductCard';
import { getEsimProducts } from '../lib/esim';
import type { EsimProduct } from '../types';

export default function EsimPage() {
  const products = getEsimProducts();
  const [selected, setSelected] = useState<EsimProduct | null>(null);

  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-gradient-to-br from-sky-tint to-sky-soft p-5 shadow-[0_4px_16px_rgba(49,130,246,0.1)]">
        <p className="text-xs font-bold text-brand">에어픽 직판</p>
        <h1 className="mt-1 text-xl font-bold leading-tight text-ink">
          유심·eSIM
        </h1>
        <p className="mt-2 text-sm font-medium text-muted">
          결제 후 QR·개통 안내를 바로 받을 수 있습니다
        </p>
      </section>

      <div className="px-1">
        <h2 className="text-sm font-bold text-ink">인기 요금제</h2>
        <p className="text-xs font-medium text-muted">{products.length}개 상품</p>
      </div>

      <div className="space-y-3">
        {products.map((product) => (
          <EsimProductCard
            key={product.id}
            product={product}
            onSelect={() => setSelected(product)}
          />
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-sky-deep/60 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-lg rounded-3xl bg-sky-soft p-5 shadow-xl">
            <p className="text-xs font-bold text-brand">
              {selected.type === 'esim' ? 'eSIM' : '유심'} · {selected.region}
            </p>
            <h2 className="mt-1 text-lg font-bold text-ink">{selected.name}</h2>
            <p className="mt-1 text-sm text-muted">
              {selected.dataLabel} · {selected.days}일
            </p>
            {selected.description && (
              <p className="mt-2 text-sm text-muted">{selected.description}</p>
            )}
            <p className="mt-3 text-xl font-bold text-brand tabular-nums">
              {selected.price.toLocaleString()}원
            </p>
            <button
              type="button"
              disabled={selected.type === 'usim'}
              className="mt-4 w-full rounded-xl bg-brand py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
              onClick={() => alert('결제·발급 기능은 준비 중입니다.')}
            >
              {selected.type === 'usim' ? '현장 수령 준비 중' : '구매하기'}
            </button>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mt-2 w-full py-2 text-sm font-semibold text-muted"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { ExternalLink } from 'lucide-react';
import { useMemo, useState } from 'react';
import EsimProductCard from '../components/EsimProductCard';
import EsimSearchPanel from '../components/EsimSearchPanel';
import { ESIM_OFFERS_UPDATED_AT } from '../config/esimPartnerOffers';
import { getEsimCountryName } from '../config/esimCountries';
import { compareEsimOffers, openPartnerOffer } from '../lib/esim';
import type { EsimProduct, EsimSearch } from '../types';
import {
  formatEsimDataPlan,
  formatEsimOffersUpdatedAt,
  formatEsimSearchSummary,
  formatEsimSimType,
} from '../utils/esimLabels';
import { defaultEsimSearch } from '../utils/esimSearch';

export default function EsimPage() {
  const [search, setSearch] = useState<EsimSearch>(defaultEsimSearch);
  const [selected, setSelected] = useState<EsimProduct | null>(null);

  const offers = useMemo(() => compareEsimOffers(search), [search]);
  const updatedLabel = formatEsimOffersUpdatedAt(ESIM_OFFERS_UPDATED_AT);

  const handleGoPartner = () => {
    if (!selected) return;
    openPartnerOffer(selected);
    setSelected(null);
  };

  return (
    <div className="space-y-5">
      <EsimSearchPanel search={search} onChange={setSearch} />

      <div className="flex items-start justify-between gap-3 px-1">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted">{formatEsimSearchSummary(search)}</p>
          {offers.length > 0 && (
            <p className="mt-1 text-xs font-bold text-ink">{offers.length}곳 · 가격 낮은 순</p>
          )}
        </div>
        {updatedLabel && (
          <p className="shrink-0 pt-0.5 text-right text-[10px] font-medium leading-snug text-muted">
            마지막 수정
            <br />
            <span className="tabular-nums text-muted-light">{updatedLabel}</span>
          </p>
        )}
      </div>

      {offers.length === 0 ? (
        <p className="rounded-2xl bg-sky-soft p-8 text-center text-sm text-muted shadow-[0_2px_8px_rgba(49,130,246,0.07)]">
          선택하신 조건의 제휴 요금이 아직 없습니다.
          <br />
          <span className="mt-1 inline-block text-xs">다른 용량·일수를 선택해 보세요.</span>
        </p>
      ) : (
        <div className="space-y-2.5">
          {offers.map((product, index) => (
            <EsimProductCard
              key={product.id}
              product={product}
              rank={index + 1}
              onSelect={() => setSelected(product)}
            />
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-sky-deep/60 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-lg rounded-3xl bg-sky-soft p-5 shadow-xl">
            <p className="text-xs font-bold text-brand">
              {formatEsimSimType(selected.type)} ·{' '}
              {selected.region || getEsimCountryName(selected.countryCode)}
            </p>
            <h2 className="mt-1 text-lg font-bold text-ink">{selected.partnerName}</h2>
            <p className="mt-1 text-sm text-muted">
              {formatEsimDataPlan(selected.dataPlan)} · {selected.days}일
            </p>
            {selected.description && (
              <p className="mt-2 text-sm text-muted">{selected.description}</p>
            )}
            <p className="mt-3 text-xl font-bold text-brand tabular-nums">
              {selected.price.toLocaleString()}원
              <span className="ml-1 text-sm font-semibold text-muted">참고가</span>
            </p>
            <p className="mt-2 text-[11px] font-medium leading-relaxed text-muted">
              제휴사 <span className="font-bold text-ink">{selected.partnerName}</span>
              에서 최종 요금·결제·개통이 진행됩니다.
            </p>
            <button
              type="button"
              disabled={!selected.partnerUrl?.trim()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
              onClick={handleGoPartner}
            >
              제휴사에서 보기
              <ExternalLink size={16} />
            </button>
            {!selected.partnerUrl?.trim() && (
              <p className="mt-2 text-center text-[11px] font-semibold text-muted">
                제휴 링크 등록 후 이용할 수 있습니다.
              </p>
            )}
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

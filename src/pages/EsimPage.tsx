import { ExternalLink } from 'lucide-react';
import { useMemo, useState } from 'react';
import EsimProductCard from '../components/EsimProductCard';
import EsimSearchPanel from '../components/EsimSearchPanel';
import { PRICE_DISCLAIMER } from '../constants/complianceCopy';
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

export default function EsimPage({
  search,
  onSearchChange,
}: {
  search: EsimSearch;
  onSearchChange: (next: EsimSearch) => void;
}) {
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
      <p className="px-1 text-[11px] font-medium leading-relaxed text-muted">{PRICE_DISCLAIMER}</p>

      <EsimSearchPanel search={search} onChange={onSearchChange} />

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
        <div className="space-y-3 rounded-2xl bg-neutral-50 p-8 text-center text-sm text-muted ring-1 ring-[#0f1a2e]/10">
          <p>선택하신 조건의 제휴 요금이 아직 없습니다.</p>
          <p className="text-xs">다른 용량·일수를 선택하거나, 초보 가이드를 확인해 보세요.</p>
          <ul className="mx-auto max-w-xs space-y-1.5 text-left text-xs font-semibold text-[#0f1a2e]">
            <li>
              <a href="/guides/esim-beginner/" className="underline-offset-2 hover:underline">
                유심·이심 초보 가이드
              </a>
            </li>
            <li>
              <a href="/guides/" className="underline-offset-2 hover:underline">
                가이드 모음
              </a>
            </li>
            <li>
              <a href="/faq/" className="underline-offset-2 hover:underline">
                자주 묻는 질문
              </a>
            </li>
          </ul>
        </div>
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
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-[#0f1a2e]/45 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-xl ring-1 ring-[#0f1a2e]/10">
            <p className="text-xs font-bold text-[#0f1a2e]">
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
            <p className="mt-3 text-xl font-bold text-[#0f1a2e] tabular-nums">
              {selected.price.toLocaleString()}원
              <span className="ml-1 text-sm font-semibold text-muted">참고가</span>
            </p>
            <p className="mt-2 text-[11px] font-medium leading-relaxed text-muted">
              제휴사 <span className="font-bold text-ink">{selected.partnerName}</span>
              에서 최종 요금·결제·개통이 진행됩니다.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex-1 rounded-xl bg-neutral-50 py-3 text-sm font-bold text-ink ring-1 ring-[#0f1a2e]/10"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={handleGoPartner}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#0f1a2e] py-3 text-sm font-bold text-white"
              >
                제휴사에서 보기
                <ExternalLink size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

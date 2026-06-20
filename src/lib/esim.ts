import { ESIM_PARTNER_OFFERS } from '../config/esimPartnerOffers';
import { trackOutboundClick, hostFromUrl } from './analytics';
import type { EsimProduct, EsimSearch } from '../types';

/** 선택 조건에 맞는 제휴 요금 · 가격 낮은 순 (속도는 필터 없이 모두 포함) */
export function compareEsimOffers(search: EsimSearch): EsimProduct[] {
  return ESIM_PARTNER_OFFERS.filter((p) => p.isActive !== false)
    .filter((p) => p.type === search.simType)
    .filter((p) => p.countryCode === search.countryCode)
    .filter((p) => p.dataPlan === search.dataPlan)
    .filter((p) => p.days === search.days)
    .sort((a, b) => a.price - b.price);
}

export function openPartnerOffer(product: EsimProduct): void {
  const url = product.partnerUrl?.trim();
  if (!url) {
    window.alert('제휴사 페이지 URL이 아직 등록되지 않았습니다.');
    return;
  }
  trackOutboundClick({
    category: 'esim_partner',
    destination: hostFromUrl(url),
    itemId: product.id,
    itemName: product.partnerName,
  });
  window.open(url, '_blank', 'noopener,noreferrer');
}

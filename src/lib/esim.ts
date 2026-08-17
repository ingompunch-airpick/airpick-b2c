import { ESIM_PARTNER_OFFERS } from '../config/esimPartnerOffers';
import { trackOutboundClick, hostFromUrl } from './analytics';
import type { EsimProduct, EsimSearch } from '../types';

/** 선택 조건에 맞는 제휴 요금 · 가격 낮은 순 (미입력 0원은 맨 아래) */
export function compareEsimOffers(search: EsimSearch): EsimProduct[] {
  return ESIM_PARTNER_OFFERS.filter((p) => p.isActive !== false)
    .filter((p) => p.type === search.simType)
    .filter((p) => p.countryCode === search.countryCode)
    .filter((p) => p.dataPlan === search.dataPlan)
    .filter((p) => p.days === search.days)
    .sort((a, b) => {
      if (a.price <= 0 && b.price > 0) return 1;
      if (b.price <= 0 && a.price > 0) return -1;
      return a.price - b.price;
    });
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

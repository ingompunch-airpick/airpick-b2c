import {
  esimAffiliateCtaLabel,
  type EsimAffiliatePartner,
} from '../config/esimAffiliatePartners';
import { trackOutboundClick, hostFromUrl } from './analytics';

export function openEsimAffiliatePartner(partner: EsimAffiliatePartner): void {
  const url = partner.affiliateUrl?.trim();
  if (!url) {
    window.alert('제휴 링크가 아직 등록되지 않았습니다.');
    return;
  }
  trackOutboundClick({
    category: 'esim_partner',
    destination: hostFromUrl(url),
    itemId: partner.id,
    itemName: partner.name,
  });
  window.open(url, '_blank', 'noopener,noreferrer');
}

export { esimAffiliateCtaLabel };

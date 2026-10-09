/**
 * 이심(eSIM) 제휴사 — 에어픽 내 비교·예약 없음.
 * 각 제휴사 할인 링크로 이동해 구매·개통.
 *
 * 제휴 할인 링크만 안내한다. 구매·개통은 제휴사 사이트에서 한다.
 */
export type EsimAffiliatePartner = {
  id: string;
  name: string;
  /** 고객 할인율 (%). 예: 5 → 「로밍도깨비5% 할인링크 바로가기」 */
  discountPercent?: number;
  /** 제휴·트래킹 할인 랜딩 URL */
  affiliateUrl: string;
  active: boolean;
  /** 화면용 한 줄 */
  note?: string;
  /** 프로모 기간 표시 (예: 9.15 ~ 10.15) */
  promoPeriodLabel?: string;
  /** YYYY-MM-DD — 있으면 기간 외에는 할인 강조를 약화 */
  promoStart?: string;
  promoEnd?: string;
};

export const ESIM_AFFILIATE_PARTNERS: readonly EsimAffiliatePartner[] = [
  {
    id: 'rokebi',
    name: '로밍도깨비',
    discountPercent: 5,
    affiliateUrl: 'https://store.rokebi.com/?pt=airpick',
    active: true,
    note: '에어픽 × 로밍도깨비 5% 할인 · 구매·개통은 로밍도깨비에서',
  },
] as const;

export function listActiveEsimAffiliatePartners(): EsimAffiliatePartner[] {
  return ESIM_AFFILIATE_PARTNERS.filter((p) => p.active && !!p.affiliateUrl.trim());
}

/** 「로밍도깨비5% 할인링크 바로가기」 */
export function esimAffiliateCtaLabel(partner: EsimAffiliatePartner): string {
  const pct =
    partner.discountPercent != null && partner.discountPercent > 0
      ? `${partner.discountPercent}%`
      : '';
  return `${partner.name}${pct} 할인링크 바로가기`;
}

/** 오늘(로컬)이 프로모 기간이면 true. 기간 미설정이면 true */
export function isEsimPromoActive(partner: EsimAffiliatePartner, todayYmd?: string): boolean {
  if (!partner.promoStart || !partner.promoEnd) return true;
  const today =
    todayYmd ??
    (() => {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    })();
  return today >= partner.promoStart && today <= partner.promoEnd;
}

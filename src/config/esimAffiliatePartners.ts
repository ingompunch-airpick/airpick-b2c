/**
 * 이심(eSIM) 제휴사 — 에어픽 내 비교·예약 없음.
 * 각 제휴사 할인 링크로 이동해 구매·개통.
 *
 * 로밍도깨비는 유심사 컨펌 뒤 추가.
 */
export type EsimAffiliatePartner = {
  id: string;
  name: string;
  /** 고객 할인율 (%). 예: 30 → 「유심사30% 할인링크 바로가기」 */
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
    id: 'usimsa',
    name: '유심사',
    discountPercent: 30,
    affiliateUrl: 'https://www.usimsa.com/partners/airpick',
    active: true,
    note: '에어픽 × 유심사 전용 할인 · 구매·개통은 유심사에서',
    promoPeriodLabel: '9.15 ~ 10.15',
    promoStart: '2026-09-15',
    promoEnd: '2026-10-15',
  },
] as const;

export function listActiveEsimAffiliatePartners(): EsimAffiliatePartner[] {
  return ESIM_AFFILIATE_PARTNERS.filter((p) => p.active && !!p.affiliateUrl.trim());
}

/** 「유심사30% 할인링크 바로가기」 */
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

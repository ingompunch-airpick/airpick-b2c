import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { normalizeAffiliateCode } from '../utils/affiliateSession';

export type AffiliateOffer = {
  code: string;
  name: string;
  status: 'active' | 'suspended';
  /** 손님 할인(원) — 링크마다 B2B에서 설정 */
  customerDiscountWon: number;
  /** 제휴 페이백(원) — 예약에 스냅샷만 저장, 정산은 별도 */
  referrerCreditWon: number;
};

function normalizeWon(raw: unknown): number {
  const n = typeof raw === 'number' ? raw : Number(String(raw ?? '').replace(/,/g, ''));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(Math.round(n), 1_000_000);
}

/** Firestore affiliates/{code} — active 만 할인 적용 대상 */
export async function fetchAffiliateOffer(codeRaw: string): Promise<AffiliateOffer | null> {
  const code = normalizeAffiliateCode(codeRaw);
  if (!code) return null;

  const snap = await getDoc(doc(db, 'affiliates', code));
  if (!snap.exists()) return null;

  const data = snap.data() as Record<string, unknown>;
  const status = data.status === 'suspended' ? 'suspended' : 'active';
  if (status !== 'active') return null;

  return {
    code,
    name: String(data.name || code).trim() || code,
    status,
    customerDiscountWon: normalizeWon(data.customerDiscountWon),
    referrerCreditWon: normalizeWon(data.referrerCreditWon),
  };
}

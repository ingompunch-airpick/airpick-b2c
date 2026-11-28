import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

/** 운영 점수로 정한 이달 추천순 가중치. 점수는 오지 않는다. */
export type PartnerExposure = {
  appliesMonth: string;
  weights: Record<string, number>;
  badgeCompanyId: string | null;
};

function kstMonth(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 7);
}

/** 이번 달에 쓸 가중치. 없거나 지난달 것이면 null — 모두 같은 비율로 돌린다. */
export async function fetchPartnerExposure(): Promise<PartnerExposure | null> {
  try {
    const snap = await getDoc(doc(db, 'partnerExposure', 'current'));
    if (!snap.exists()) return null;
    const data = snap.data();
    if (String(data.appliesMonth || '') !== kstMonth()) return null;
    const weights: Record<string, number> = {};
    const raw = (data.weights || {}) as Record<string, unknown>;
    for (const [id, value] of Object.entries(raw)) {
      const w = Number(value);
      if (Number.isFinite(w) && w >= 0) weights[id] = w;
    }
    const badge = typeof data.badgeCompanyId === 'string' ? data.badgeCompanyId.trim() : '';
    return { appliesMonth: kstMonth(), weights, badgeCompanyId: badge || null };
  } catch {
    return null;
  }
}

/** 가중치가 없는 업체(신규 입점 등)는 1 */
export function exposureWeight(exposure: PartnerExposure | null, companyId: string): number {
  const w = exposure?.weights[companyId];
  return typeof w === 'number' ? w : 1;
}

import { ESIM_PARTNER_OFFERS } from '../config/esimPartnerOffers';
import { mergeParkingCompareCompanies } from './parkingCompare';
import type { Company } from '../types';

export type HomeTrustStat = {
  value: string;
  label: string;
  hint: string;
};

/** 홈 Hero 숫자 — 주차(Firestore+코드)·eSIM(시트 sync) 등록과 연동 */
export function buildHomeTrustStats(firestoreCompanies: Company[]): HomeTrustStat[] {
  const parkingCount = mergeParkingCompareCompanies(firestoreCompanies).length;
  const esimCount = ESIM_PARTNER_OFFERS.filter((o) => o.isActive !== false).length;
  const partnerCount = firestoreCompanies.filter((c) => c.isAirpickPartner !== false).length;

  return [
    {
      value: String(parkingCount),
      label: '주차대행 업체',
      hint: '입점·미입점 포함',
    },
    {
      value: String(esimCount),
      label: 'eSIM·유심 요금',
      hint: '제휴사별 비교',
    },
    {
      value: String(partnerCount),
      label: '입점 업체',
      hint: '바로 예약·추적',
    },
  ];
}

import type { Company } from '../types';
import { isAirpickPartner } from '../utils/compareSort';

/** 주차 비교 목록 — Firestore 입점(에어픽 인증 업체)만 */
export function listParkingCompareCompanies(firestoreCompanies: Company[]): Company[] {
  return firestoreCompanies
    .filter((c) => isAirpickPartner(c) && c.listingApproved !== false)
    .map((c) => ({
      ...c,
      isAirpickPartner: true,
    }));
}

import type { Company } from '../types';
import { isAirpickPartner } from '../utils/compareSort';

/** 주차 비교 목록 — Firestore 입점(공식 파트너)만 */
export function listParkingCompareCompanies(firestoreCompanies: Company[]): Company[] {
  return firestoreCompanies
    .filter((c) => isAirpickPartner(c))
    .map((c) => ({
      ...c,
      isAirpickPartner: true,
    }));
}

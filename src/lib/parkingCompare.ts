import { externalParkingCompanies } from '../config/externalParkingCompanies';
import type { Company } from '../types';

/** Firestore 입점 업체 + 비교용 외부 업체 목록 */
export function mergeParkingCompareCompanies(firestoreCompanies: Company[]): Company[] {
  const partners = firestoreCompanies.map((c) => ({
    ...c,
    isAirpickPartner: c.isAirpickPartner !== false,
  }));

  const externalOnly = externalParkingCompanies.filter(
    (c) => !partners.some((p) => p.id === c.id)
  );

  return [...partners, ...externalOnly];
}

export function openExternalBooking(company: Company): void {
  const url = company.externalBookingUrl?.trim();
  if (!url) {
    window.alert('예약 페이지 URL이 등록되지 않았습니다.');
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

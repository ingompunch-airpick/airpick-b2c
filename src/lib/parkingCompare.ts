import { externalParkingCompanies } from '../config/externalParkingCompanies.generated';
import { trackOutboundClick, hostFromUrl } from './analytics';
import type { Company } from '../types';

/**
 * 주차 비교 목록 — Firestore 입점 업체 + 구글 시트 미입점 업체(sync 생성).
 * 같은 id는 입점(Firestore) 우선.
 */
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
  trackOutboundClick({
    category: 'parking_external',
    destination: hostFromUrl(url),
    itemId: company.id,
    itemName: company.name,
  });
  window.open(url, '_blank', 'noopener,noreferrer');
}

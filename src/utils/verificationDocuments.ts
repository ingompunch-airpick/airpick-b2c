import type { Company, CompanyVerificationDocuments } from '../types';
import { displayInsuranceLabel } from './trust';
import { shouldShowInsuranceBadge } from './trustDisplay';

export function parseVerificationDocuments(
  data: Record<string, unknown>
): CompanyVerificationDocuments | undefined {
  const raw = data.verificationDocuments;
  if (!raw || typeof raw !== 'object') return undefined;

  const v = raw as Record<string, unknown>;
  const businessRegistrationUrl = String(v.businessRegistrationUrl || '').trim() || undefined;
  // 주차장 계약서는 2026-11-14부터 받지도 보여주지도 않음 (B2B 입력 화면 제거) — 기존 값도 무시
  if (!businessRegistrationUrl) return undefined;
  return { businessRegistrationUrl };
}

export function hasBusinessRegistrationDocument(company: Company): boolean {
  return !!company.verificationDocuments?.businessRegistrationUrl?.trim();
}

export function hasParkingContractDocument(company: Company): boolean {
  return !!company.verificationDocuments?.parkingContractUrl?.trim();
}

export function hasInsuranceCertificate(company: Company): boolean {
  return shouldShowInsuranceBadge(company) && !!displayInsuranceLabel(company);
}

/** 업체 상세 — 입점 확인 서류 1건 이상 */
export function companyHasVerificationDocuments(company: Company): boolean {
  return (
    hasBusinessRegistrationDocument(company) ||
    hasParkingContractDocument(company) ||
    hasInsuranceCertificate(company)
  );
}

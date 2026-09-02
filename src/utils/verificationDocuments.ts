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
  const parkingContractUrl = String(v.parkingContractUrl || '').trim() || undefined;

  if (!businessRegistrationUrl && !parkingContractUrl) return undefined;
  return { businessRegistrationUrl, parkingContractUrl };
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

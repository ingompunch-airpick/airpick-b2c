import type { Company, CompanyInsurance, Reservation } from '../types';

const INSURANCE_DISCLAIMER =
  '보험 적용·보상 범위는 해당 업체와 보험사 약관에 따릅니다.';

export { INSURANCE_DISCLAIMER };

export interface InsuranceDisplay {
  status: 'enrolled' | 'not_enrolled' | 'unknown';
  /** MY·뱃지에 표시할 한 줄 */
  summary?: string;
  /** 상품명 등 부가 설명 */
  detail?: string;
}

function parseInsuranceObject(raw: Record<string, unknown>): CompanyInsurance | undefined {
  if (raw.enrolled === false) {
    return { enrolled: false };
  }
  if (raw.enrolled !== true) return undefined;

  const provider = raw.provider ? String(raw.provider).trim() : undefined;
  const productName = raw.productName ? String(raw.productName).trim() : undefined;
  const limitRaw = raw.coverageLimitWon ?? raw.coverageLimit;
  const coverageLimitWon =
    limitRaw !== undefined && limitRaw !== null && limitRaw !== ''
      ? Number(limitRaw)
      : undefined;

  return {
    enrolled: true,
    provider: provider || undefined,
    productName: productName || undefined,
    coverageLimitWon:
      coverageLimitWon !== undefined && !Number.isNaN(coverageLimitWon)
        ? coverageLimitWon
        : undefined,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
  };
}

/** Firestore companies / reservations → 통일 insurance 객체 */
export function parseInsuranceFromFirestore(
  data: Record<string, unknown>
): CompanyInsurance | undefined {
  if (data.insurance && typeof data.insurance === 'object') {
    return parseInsuranceObject(data.insurance as Record<string, unknown>);
  }

  if (data.hasInsurance === false) {
    return { enrolled: false };
  }

  const provider = data.insuranceProvider ? String(data.insuranceProvider).trim() : '';
  const limit = data.insuranceLimit ? Number(data.insuranceLimit) : undefined;
  if (provider || (limit !== undefined && !Number.isNaN(limit))) {
    return {
      enrolled: true,
      provider: provider || undefined,
      coverageLimitWon: limit !== undefined && !Number.isNaN(limit) ? limit : undefined,
    };
  }

  return undefined;
}

export function formatCoverageLimitWon(won: number): string {
  if (won >= 100_000_000) {
    const eok = won / 100_000_000;
    return Number.isInteger(eok) ? `${eok}억원` : `${eok.toFixed(1)}억원`;
  }
  if (won >= 10_000_000) {
    return `${Math.round(won / 10_000_000)}천만원`;
  }
  return `${won.toLocaleString()}원`;
}

export function formatInsuranceSummary(insurance: CompanyInsurance): string | undefined {
  if (!insurance.enrolled) return undefined;

  const parts: string[] = [];
  if (insurance.provider) parts.push(insurance.provider);
  if (insurance.productName) parts.push(insurance.productName);
  if (insurance.coverageLimitWon) {
    parts.push(`보장 ${formatCoverageLimitWon(insurance.coverageLimitWon)}`);
  }

  if (parts.length) return parts.join(' · ');
  return '보험 가입';
}

export function resolveInsuranceDisplay(
  reservation: Reservation,
  company?: Company
): InsuranceDisplay {
  const fromReservation = reservation.insurance ?? legacyReservationInsurance(reservation);
  const fromCompany = company?.insurance ?? legacyCompanyInsurance(company);

  const insurance = fromReservation ?? fromCompany;

  if (!insurance) {
    return { status: 'unknown' };
  }

  if (!insurance.enrolled) {
    return { status: 'not_enrolled', summary: '보험 미가입' };
  }

  const summary = formatInsuranceSummary(insurance);
  const detail =
    insurance.productName && insurance.provider
      ? undefined
      : insurance.productName || undefined;

  return {
    status: 'enrolled',
    summary,
    detail,
  };
}

function legacyReservationInsurance(reservation: Reservation): CompanyInsurance | undefined {
  if (!reservation.insuranceProvider && !reservation.insuranceLimit) return undefined;
  return {
    enrolled: true,
    provider: reservation.insuranceProvider,
    coverageLimitWon: reservation.insuranceLimit,
  };
}

function legacyCompanyInsurance(company?: Company): CompanyInsurance | undefined {
  if (!company) return undefined;
  if (company.hasInsurance === false) return { enrolled: false };
  if (!company.insuranceProvider && !company.insuranceLimit) return undefined;
  return {
    enrolled: true,
    provider: company.insuranceProvider,
    coverageLimitWon: company.insuranceLimit,
  };
}

/** 비교 탭 뱃지용 — 등록된 보험만 짧게 표시 */
export function displayInsuranceBadgeLabel(company: Company): string | null {
  if (company.sharesInsurance === false) return null;

  const insurance =
    company.insurance ??
    (company.hasInsurance === false
      ? { enrolled: false as const }
      : company.insuranceProvider || company.insuranceLimit
        ? {
            enrolled: true as const,
            provider: company.insuranceProvider,
            coverageLimitWon: company.insuranceLimit,
          }
        : undefined);

  if (!insurance) return null;
  if (!insurance.enrolled) return null;

  const summary = formatInsuranceSummary(insurance);
  return summary && summary !== '보험 가입' ? summary : '보험 가입';
}

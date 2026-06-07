import type { Company } from '../types';

export function displayInsuranceLabel(company: Company): string | null {
  if (company.insuranceProvider) {
    const limit = company.insuranceLimit
      ? ` ${Math.round(company.insuranceLimit / 10000)}천만`
      : '';
    return `${company.insuranceProvider}${limit}`;
  }
  if (company.features.some((f) => /보험|손해/i.test(f))) return '보험 가입';
  if (company.hasInsurance !== false) return '보험';
  return null;
}

export function getStatusStep(status: string): number {
  const map: Record<string, number> = {
    pending: 0,
    scheduled: 1,
    checked_in: 2,
    checked_out: 3,
    cancelled: -1,
  };
  return map[status] ?? 0;
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: '접수 완료',
    scheduled: '입고 예정',
    checked_in: '주차 중',
    checked_out: '출고 완료',
    cancelled: '취소됨',
  };
  return map[status] ?? '접수 완료';
}

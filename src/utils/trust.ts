import type { Company } from '../types';
import { displayInsuranceBadgeLabel } from './insurance';

export function displayInsuranceLabel(company: Company): string | null {
  return displayInsuranceBadgeLabel(company);
}

/**
 * 타임라인의 현재 칸. 0 접수, 1 입고, 2 주차중, 3 출고.
 * 4는 출고까지 끝난 상태라 칸이 모두 채워진다.
 * 주차장 위치·사진은 2(주차 중)부터 연다.
 */
export function getStatusStep(status: string): number {
  const map: Record<string, number> = {
    pending: 0,
    scheduled: 1,
    pending_in: 1,
    checked_in: 2,
    completed_in: 2,
    request_out: 3,
    checked_out: 4,
    completed_out: 4,
    cancelled: -1,
  };
  return map[status] ?? 0;
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: '접수 완료',
    scheduled: '입고 예정',
    pending_in: '입고 예정',
    checked_in: '주차 중',
    completed_in: '주차 중',
    request_out: '출고 대기',
    checked_out: '출고 완료',
    completed_out: '출고 완료',
    cancelled: '취소됨',
  };
  return map[status] ?? '접수 완료';
}

/** 손님용 표시명 — 「홍길동 기사」 (마스터 폴백「업체 담당」은 그대로) */
function formatStaffDisplayName(raw?: string): string | null {
  const name = raw?.trim();
  if (!name) return null;
  if (name === '업체 담당' || name.endsWith('기사')) return name;
  return `${name} 기사`;
}

/** 내 예약 · 입고/출고 기사 한 줄 (B2B checkedInBy / checkedOutBy) */
export function formatCheckInStaffLine(checkedInBy?: string): string | null {
  const label = formatStaffDisplayName(checkedInBy);
  if (!label) return null;
  return `입고 : ${label}`;
}

export function formatCheckOutStaffLine(checkedOutBy?: string): string | null {
  const label = formatStaffDisplayName(checkedOutBy);
  if (!label) return null;
  return `출고 : ${label}`;
}

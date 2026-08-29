import type { Company } from '../types';
import { cn } from '../utils/cn';
import { displayInsuranceLabel } from '../utils/trust';
import {
  shouldShowInsuranceBadge,
  shouldShowLocationBadge,
  shouldShowPhotosBadge,
} from '../utils/trustDisplay';

/** 카드용 — 칩 없이 조용한 한 줄 메타 (홈 VERIFIED 시각과 역할 분리) */
export default function TrustBadges({
  company,
  size = 'sm',
}: {
  company: Company;
  size?: 'sm' | 'md';
}) {
  const parts: string[] = [];

  if (shouldShowInsuranceBadge(company)) {
    const insuranceLabel = displayInsuranceLabel(company);
    parts.push(
      insuranceLabel && insuranceLabel !== '보험' && insuranceLabel !== '보험 가입'
        ? insuranceLabel
        : '보험'
    );
  }
  if (shouldShowPhotosBadge(company)) parts.push('입고사진');
  if (shouldShowLocationBadge(company)) parts.push('주차장');

  if (parts.length === 0) return null;

  return (
    <p
      className={cn(
        'font-medium leading-snug text-[#0f1a2e]/45',
        size === 'sm' ? 'text-[11px]' : 'text-[12px]'
      )}
    >
      {parts.join(' · ')}
    </p>
  );
}

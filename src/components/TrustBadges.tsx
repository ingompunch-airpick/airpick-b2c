import { Camera, MapPin, ShieldCheck } from 'lucide-react';
import type { Company } from '../types';
import { cn } from '../utils/cn';
import { displayInsuranceLabel } from '../utils/trust';
import {
  shouldShowInsuranceBadge,
  shouldShowLocationBadge,
  shouldShowPhotosBadge,
} from '../utils/trustDisplay';

const badgeConfig = [
  { key: 'location' as const, icon: MapPin, label: '위치 공유' },
  { key: 'photos' as const, icon: Camera, label: '사진 공유' },
  { key: 'insurance' as const, icon: ShieldCheck, label: '보험' },
];

export default function TrustBadges({
  company,
  size = 'sm',
}: {
  company: Company;
  size?: 'sm' | 'md';
}) {
  const insuranceLabel = displayInsuranceLabel(company);

  return (
    <div className={cn('flex flex-wrap gap-1.5', size === 'md' && 'gap-2')}>
      {badgeConfig.map(({ key, icon: Icon, label }) => {
        if (key === 'location' && !shouldShowLocationBadge(company)) return null;
        if (key === 'photos' && !shouldShowPhotosBadge(company)) return null;
        if (key === 'insurance' && !shouldShowInsuranceBadge(company)) return null;

        const text =
          key === 'insurance' && insuranceLabel && insuranceLabel !== '보험'
            ? insuranceLabel
            : label;

        return (
          <span
            key={key}
            className={cn(
              'inline-flex items-center gap-1 rounded-full bg-brand/10 font-semibold text-brand',
              size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'
            )}
          >
            <Icon size={size === 'sm' ? 10 : 12} strokeWidth={2.5} />
            {text}
          </span>
        );
      })}
    </div>
  );
}

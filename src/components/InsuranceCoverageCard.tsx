import { ShieldCheck } from 'lucide-react';
import { CANONICAL_INSURANCE_PRODUCT_NAME, INSURANCE_DISCLAIMER } from '../utils/insurance';
import { cn } from '../utils/cn';

export default function InsuranceCoverageCard({
  summary,
  detail,
  className,
}: {
  summary: string;
  detail?: string;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-white p-3.5 ring-2 ring-emerald-200/90 shadow-[0_2px_12px_rgba(16,185,129,0.1)]',
        className
      )}
      aria-label="보험 가입 확인"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500 shadow-[0_4px_12px_rgba(16,185,129,0.35)]">
          <ShieldCheck size={22} className="text-white" strokeWidth={2.5} aria-hidden />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm font-bold leading-tight text-ink">보험 가입 확인</p>
          <p className="mt-1 text-[13px] font-bold leading-snug text-ink">{summary}</p>
          {detail ? (
            <p className="mt-0.5 text-[11px] font-semibold text-emerald-800/85">{detail}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-2.5 rounded-lg bg-emerald-100/75 px-3 py-2 ring-1 ring-emerald-200/50">
        <p className="text-[10px] font-medium leading-relaxed text-emerald-900/80">
          사고 발생 시{' '}
          <span className="font-bold text-emerald-800">{CANONICAL_INSURANCE_PRODUCT_NAME}</span>{' '}
          보장 적용 ·{' '}
          {INSURANCE_DISCLAIMER}
        </p>
      </div>
    </section>
  );
}

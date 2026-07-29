import { Car, ShieldCheck } from 'lucide-react';
import { INSURANCE_DISCLAIMER } from '../utils/insurance';
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
        'overflow-hidden rounded-2xl bg-gradient-to-b from-emerald-50 via-white to-white ring-2 ring-emerald-200/90 shadow-[0_4px_20px_rgba(16,185,129,0.12)]',
        className
      )}
      aria-label="발렛보험 가입 안내"
    >
      <div className="px-4 pt-4 pb-2 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 ring-4 ring-emerald-50">
          <Car size={20} className="text-emerald-600" strokeWidth={2.25} aria-hidden />
        </div>
        <p className="mt-2.5 text-[11px] font-bold tracking-wide text-emerald-600">Valet Insurance</p>
        <p className="mt-0.5 text-base font-bold text-ink">발렛보험 가입 확인</p>
      </div>

      <div className="flex justify-center px-4 py-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 shadow-[0_6px_18px_rgba(16,185,129,0.4)]">
          <ShieldCheck size={32} className="text-white" strokeWidth={2.5} aria-hidden />
        </div>
      </div>

      <div className="px-4 pb-4">
        <p className="text-center text-[15px] font-bold leading-snug text-ink">{summary}</p>
        {detail ? (
          <p className="mt-1 text-center text-xs font-semibold text-emerald-800/85">{detail}</p>
        ) : null}
        <div className="mt-3 rounded-xl bg-emerald-100/80 px-3.5 py-3 ring-1 ring-emerald-200/60">
          <p className="text-center text-[10px] font-medium leading-relaxed text-emerald-900/80">
            서비스 이용 중 사고 발생 시{' '}
            <span className="font-bold text-emerald-800">발렛보험</span> 보장이 적용됩니다.
          </p>
          <p className="mt-1.5 text-center text-[10px] font-medium leading-relaxed text-emerald-900/65">
            {INSURANCE_DISCLAIMER}
          </p>
        </div>
      </div>
    </section>
  );
}

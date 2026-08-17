import { ExternalLink, ShieldCheck } from 'lucide-react';
import { CANONICAL_INSURANCE_PRODUCT_NAME, INSURANCE_DISCLAIMER } from '../utils/insurance';
import { cn } from '../utils/cn';

export default function InsuranceCoverageCard({
  summary,
  detail,
  certificateUrl,
  className,
}: {
  summary: string;
  detail?: string;
  certificateUrl?: string;
  className?: string;
}) {
  const cert = certificateUrl?.trim();

  return (
    <section
      className={cn(
        'overflow-hidden rounded-2xl bg-sky-bg p-3.5 ring-1 ring-sky-border/60',
        className
      )}
      aria-label="보험 가입 확인"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500">
          <ShieldCheck size={18} className="text-white" strokeWidth={2.5} aria-hidden />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm font-bold leading-tight text-ink">보험 가입 확인</p>
          <p className="mt-1 text-[13px] font-bold leading-snug text-ink">{summary}</p>
          {detail ? (
            <p className="mt-0.5 text-[11px] font-semibold text-muted">{detail}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-2.5 rounded-lg bg-white/80 px-3 py-2 ring-1 ring-sky-border/50">
        <p className="text-[10px] font-medium leading-relaxed text-muted">
          사고 발생 시{' '}
          <span className="font-bold text-ink">{CANONICAL_INSURANCE_PRODUCT_NAME}</span>{' '}
          보장 적용 · {INSURANCE_DISCLAIMER}
        </p>
      </div>

      {cert ? (
        <a
          href={cert}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2.5 flex items-center justify-center gap-1.5 rounded-xl bg-white py-2.5 text-xs font-bold text-brand ring-1 ring-sky-border/70 transition-colors hover:bg-sky-soft"
        >
          <ExternalLink size={14} strokeWidth={2.25} />
          보험증권 보기
        </a>
      ) : null}
    </section>
  );
}

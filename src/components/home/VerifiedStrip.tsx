import { ChevronRight } from 'lucide-react';
import { AIRPICK_VERIFIED } from '../../constants/marketing';

/** 홈 · AIRPICK VERIFIED 한 줄 — 선정 기준으로 연결 */
export default function VerifiedStrip({ partnerCount }: { partnerCount: number }) {
  const meta =
    partnerCount > 0
      ? `파트너 ${partnerCount}곳 · 보험 · 입고사진 · 주차장`
      : '보험 · 입고사진 · 주차장';

  return (
    <a
      href={AIRPICK_VERIFIED.criteriaHref}
      className="block overflow-hidden rounded-2xl bg-[#0f1a2e] px-4 py-3.5 text-white shadow-[0_8px_24px_rgba(15,26,46,0.18)] transition active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold tracking-[0.14em] text-[#c9a962]">
            {AIRPICK_VERIFIED.label}
          </p>
          <p className="mt-1 text-[13px] font-semibold leading-snug text-white/95">
            {AIRPICK_VERIFIED.homeLine}
          </p>
          <p className="mt-1 text-[11px] font-medium text-white/55">{meta}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-0.5 pt-0.5 text-[11px] font-bold text-[#c9a962]">
          {AIRPICK_VERIFIED.criteriaCta}
          <ChevronRight size={14} strokeWidth={2.5} aria-hidden />
        </span>
      </div>
    </a>
  );
}

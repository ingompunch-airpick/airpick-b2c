import { Smartphone } from 'lucide-react';
import { APP_TAB_SOON, HOME_TRAVEL_SERVICES } from '../../constants/marketing';
import type { AppTab } from '../../types';

/** 홈 하단 · 주차 다음 여행 서비스 (히어로 이심 CTA 대체) */
export default function HomeTravelServices({
  onGoTab,
}: {
  onGoTab: (tab: AppTab) => void;
}) {
  if (APP_TAB_SOON.esim) return null;

  return (
    <section className="border-t border-[#0f1a2e]/10 pt-8 md:pt-10">
      <p className="text-[10px] font-bold tracking-[0.14em] text-[#c9a962]">
        {HOME_TRAVEL_SERVICES.eyebrow}
      </p>
      <h2 className="mt-1 text-[1.2rem] font-bold leading-snug tracking-tight text-[#0f1a2e] md:text-[1.35rem]">
        {HOME_TRAVEL_SERVICES.title}
      </h2>
      <p className="mt-2 max-w-lg text-[13px] font-medium leading-relaxed text-[#0f1a2e]/50 md:text-[14px]">
        {HOME_TRAVEL_SERVICES.lead}
      </p>

      <button
        type="button"
        onClick={() => onGoTab('esim')}
        className="mt-5 flex w-full max-w-md items-center justify-between gap-3 rounded-xl bg-[#0f1a2e]/[0.04] px-4 py-3.5 text-left ring-1 ring-[#0f1a2e]/10 transition hover:bg-[#0f1a2e]/[0.06] active:scale-[0.99] md:py-4"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0f1a2e] text-[#c9a962]">
            <Smartphone size={17} strokeWidth={2.25} aria-hidden />
          </span>
          <span>
            <span className="block text-[14px] font-bold text-[#0f1a2e]">{HOME_TRAVEL_SERVICES.esimCta}</span>
            <span className="mt-0.5 block text-[11px] font-medium text-[#0f1a2e]/45">
              해외 데이터 · 출국 전 준비
            </span>
          </span>
        </span>
        <span className="shrink-0 text-[12px] font-bold text-[#0f1a2e]/35" aria-hidden>
          →
        </span>
      </button>
    </section>
  );
}

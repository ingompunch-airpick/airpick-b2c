import { Check, ChevronRight } from 'lucide-react';
import { AIRPICK_CARE } from '../../constants/marketing';
import { trackCtaClick } from '../../lib/analytics';

/**
 * 홈 배너 바로 아래(검색 카드 위) — AIRPICK PROMISE(에어픽 안심케어) 3가지.
 * 배너 위에 걸치므로 흰 패널로 감싼다. 모바일·PC 모두 3칸.
 */
export default function HomePromiseStrip() {
  return (
    <section
      aria-labelledby="home-promise-title"
      className="rounded-[28px] bg-white p-4 shadow-[0_12px_40px_rgba(15,26,46,0.08)] ring-1 ring-[#0f1a2e]/6 md:p-5"
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 id="home-promise-title" className="flex items-center gap-1.5 text-[17px] font-bold text-[#0f1a2e] md:text-[19px]">
            <img src="/brand-mark-gold.png?v=10" alt="" width={20} height={20} className="h-5 w-5 shrink-0 object-contain" draggable={false} />
            {AIRPICK_CARE.name}
          </h2>
        </div>
        <a
          href={AIRPICK_CARE.href}
          onClick={() => trackCtaClick('care_detail', 'home_promise')}
          className="inline-flex shrink-0 items-center text-[14px] font-semibold text-[#0f1a2e]/60 hover:text-[#0f1a2e]"
        >
          자세히
          <ChevronRight size={15} aria-hidden />
        </a>
      </div>

      <ul className="mt-3 grid grid-cols-3 gap-2 md:gap-3">
        {AIRPICK_CARE.items.map((item) => (
          <li key={item.id} className="rounded-2xl bg-[#f4f5f7] p-2.5 md:p-4">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0f1a2e] md:h-7 md:w-7">
              <Check size={14} strokeWidth={3} className="text-[#c9a962]" aria-hidden />
            </span>
            <p className="mt-2 break-keep text-[14px] font-bold leading-snug text-[#0f1a2e] md:text-[16px]">{item.title}</p>
            <p className="mt-0.5 break-keep text-[13px] font-medium leading-snug text-[#0f1a2e]/60 md:text-[14px]">{item.short}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

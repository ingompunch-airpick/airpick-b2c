import { Check, ChevronRight, ShieldCheck } from 'lucide-react';
import { AIRPICK_CARE } from '../../constants/marketing';
import { COMPANY_LEGAL } from '../../constants/companyLegal';
import { trackCtaClick } from '../../lib/analytics';

/**
 * 홈 검색 카드 바로 아래 — AIRPICK PROMISE(에어픽 안심케어) 5가지.
 * PC 5칸 한 줄 / 모바일 가로 스크롤 카드.
 */
export default function HomePromiseStrip() {
  return (
    <section aria-labelledby="home-promise-title" className="mt-6">
      <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1 px-1">
        <div>
          <p className="text-[11px] font-bold tracking-[0.2em] text-[#b8954a]">AIRPICK PROMISE</p>
          <h2 id="home-promise-title" className="mt-0.5 flex items-center gap-1.5 text-[18px] font-bold text-[#0f1a2e] md:text-[20px]">
            <ShieldCheck size={20} strokeWidth={2.25} className="text-[#b8954a]" aria-hidden />
            {AIRPICK_CARE.name}
          </h2>
        </div>
        <div className="flex items-center gap-3 text-[13px] font-semibold">
          <a
            href={AIRPICK_CARE.href}
            onClick={() => trackCtaClick('care_detail', 'home_promise')}
            className="inline-flex items-center text-[#0f1a2e]/70 hover:text-[#0f1a2e]"
          >
            자세히
            <ChevronRight size={15} aria-hidden />
          </a>
          <a
            href={COMPANY_LEGAL.kakaoChatUrl}
            target="_blank"
            rel="noopener"
            onClick={() => trackCtaClick('care_report', 'home_promise')}
            className="inline-flex items-center text-[#0f1a2e]/70 hover:text-[#0f1a2e]"
          >
            카톡 접수
            <ChevronRight size={15} aria-hidden />
          </a>
        </div>
      </div>

      <ul className="-mx-4 mt-3 flex snap-x gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0">
        {AIRPICK_CARE.items.map((item) => (
          <li
            key={item.id}
            className="w-[11.5rem] shrink-0 snap-start rounded-2xl bg-white p-4 ring-1 ring-[#0f1a2e]/8 md:w-auto"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0f1a2e]">
              <Check size={15} strokeWidth={3} className="text-[#c9a962]" aria-hidden />
            </span>
            <p className="mt-2.5 text-[15px] font-bold leading-snug text-[#0f1a2e]">{item.title}</p>
            <p className="mt-1 text-[13px] font-medium leading-relaxed text-[#0f1a2e]/60">{item.short}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

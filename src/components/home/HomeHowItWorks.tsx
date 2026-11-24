import { ChevronRight, MessageCircle, ShieldCheck } from 'lucide-react';
import { AIRPICK_CARE, HOME_HOW } from '../../constants/marketing';
import { COMPANY_LEGAL } from '../../constants/companyLegal';
import { trackCtaClick } from '../../lib/analytics';

/** 홈 · 업체 목록 아래 — 에어픽 안심케어(5) + 이용 방법(4단계). 실제 운영하는 것만 적는다. */
export default function HomeHowItWorks() {
  return (
    <section aria-labelledby="home-care-title" className="space-y-10">
      <div className="rounded-3xl bg-[#0f1a2e] p-5 text-white md:p-7">
        <div className="flex items-center gap-2">
          <ShieldCheck size={24} strokeWidth={2.25} className="text-[#c9a962]" aria-hidden />
          <h2 id="home-care-title" className="text-[1.3rem] font-bold tracking-tight md:text-[1.5rem]">
            {AIRPICK_CARE.name}
          </h2>
        </div>
        <p className="mt-1.5 text-[14px] font-medium text-white/75 md:text-[15px]">{AIRPICK_CARE.lead}</p>
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {AIRPICK_CARE.items.map((item) => (
            <li key={item.id} className="rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10">
              <p className="text-[15px] font-bold text-[#e3c987]">{item.title}</p>
              <p className="mt-1 text-[13px] font-medium leading-relaxed text-white/80 md:text-[14px]">{item.body}</p>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <a
            href={COMPANY_LEGAL.kakaoChatUrl}
            target="_blank"
            rel="noopener"
            onClick={() => trackCtaClick('care_report', 'home_care')}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#c9a962] px-4 py-3 text-[15px] font-bold text-[#0a1628]"
          >
            <MessageCircle size={17} strokeWidth={2.25} aria-hidden />
            {AIRPICK_CARE.reportCta}
          </a>
          <a
            href={AIRPICK_CARE.href}
            onClick={() => trackCtaClick('care_detail', 'home_care')}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl px-4 py-3 text-[15px] font-semibold text-white ring-1 ring-white/30"
          >
            안심케어 자세히 보기
            <ChevronRight size={17} aria-hidden />
          </a>
        </div>
        <p className="mt-2 text-center text-[12px] font-medium text-white/55 sm:text-left">
          접수 운영 {AIRPICK_CARE.hours}
        </p>
      </div>

      <div>
        <h2 className="text-[1.3rem] font-bold tracking-tight text-[#0f1a2e] md:text-[1.5rem]">
          {HOME_HOW.stepsTitle}
        </h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {HOME_HOW.steps.map((step, index) => (
            <li key={step.id} className="flex gap-3 rounded-2xl bg-white p-4 ring-1 ring-[#0f1a2e]/8 md:flex-col md:gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0f1a2e] text-[13px] font-bold text-white">
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="text-[15px] font-bold text-[#0f1a2e]">{step.title}</p>
                <p className="mt-0.5 text-[13px] font-medium leading-relaxed text-[#0f1a2e]/65">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

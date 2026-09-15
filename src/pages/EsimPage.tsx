import {
  ExternalLink,
  Gift,
  Headset,
  ShieldCheck,
  Signal,
  Smartphone,
  type LucideIcon,
} from 'lucide-react';
import {
  esimAffiliateCtaLabel,
  isEsimPromoActive,
  listActiveEsimAffiliatePartners,
  type EsimAffiliatePartner,
} from '../config/esimAffiliatePartners';
import { ESIM_HUB } from '../constants/marketing';
import { openEsimAffiliatePartner } from '../lib/esim';

const WHY_ICONS: Record<(typeof ESIM_HUB.whyItems)[number]['id'], LucideIcon> = {
  support: Headset,
  refund: ShieldCheck,
  stability: Signal,
  gift: Gift,
};

function PartnerPromoCard({ partner }: { partner: EsimAffiliatePartner }) {
  const promoOn = isEsimPromoActive(partner);
  const cta = esimAffiliateCtaLabel(partner);
  const pct = partner.discountPercent;

  return (
    <section className="overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#0f1a2e] via-[#16233d] to-[#1a2744] text-white shadow-[0_12px_36px_rgba(15,26,46,0.22)]">
      <div className="relative px-5 pb-5 pt-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-8 h-36 w-36 rounded-full bg-[#c9a244]/15 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center justify-center opacity-[0.14]"
        >
          <Smartphone size={120} strokeWidth={1.25} />
        </div>

        <div className="relative">
          {promoOn && pct != null ? (
            <p className="inline-flex items-center rounded-full bg-[#c9a244]/20 px-2.5 py-1 text-[11px] font-bold tracking-wide text-[#e8d5a3] ring-1 ring-[#c9a244]/35">
              에어픽 제휴 · {pct}% 할인
              {partner.promoPeriodLabel ? ` · ${partner.promoPeriodLabel}` : ''}
            </p>
          ) : (
            <p className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white/80 ring-1 ring-white/15">
              에어픽 제휴 · {partner.name}
            </p>
          )}

          <h2 className="mt-3 text-[1.35rem] font-bold leading-snug tracking-tight">
            {promoOn && pct != null ? (
              <>
                {partner.name}
                <span className="text-[#e8d5a3]">{pct}%</span> 할인으로
                <br />
                해외 데이터를 준비하세요
              </>
            ) : (
              <>
                {partner.name}에서
                <br />
                해외 데이터를 준비하세요
              </>
            )}
          </h2>
          <p className="mt-2 max-w-[18rem] text-[12px] font-medium leading-relaxed text-white/65">
            {partner.note ?? '에어픽 × 유심사 프로모션'}
          </p>

          <button
            type="button"
            onClick={() => openEsimAffiliatePartner(partner)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#c9a244] py-3.5 text-[15px] font-bold text-[#0f1a2e] shadow-[0_8px_20px_rgba(201,162,68,0.35)] transition hover:bg-[#d4b15a]"
          >
            {cta}
            <ExternalLink size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default function EsimPage() {
  const partners = listActiveEsimAffiliatePartners();

  return (
    <div className="space-y-6">
      <header className="px-0.5">
        <p className="text-[11px] font-bold tracking-[0.14em] text-[#c9a244]">
          {ESIM_HUB.cobrand}
        </p>
        <h1 className="mt-1 text-[1.65rem] font-bold tracking-tight text-[#0f1a2e]">
          {ESIM_HUB.title}
        </h1>
        <p className="mt-1.5 text-[13px] font-semibold leading-relaxed text-[#0f1a2e]/70">
          {ESIM_HUB.cobrandKo}{' '}
          <span className="text-[#c9a244]">{ESIM_HUB.promoLabel}</span>
        </p>
      </header>

      {partners.length === 0 ? (
        <div className="rounded-2xl bg-neutral-50 p-8 text-center text-sm text-muted ring-1 ring-[#0f1a2e]/10">
          <p>제휴 할인 링크를 준비 중입니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {partners.map((partner) => (
            <PartnerPromoCard key={partner.id} partner={partner} />
          ))}
        </div>
      )}

      <section className="space-y-4 rounded-[1.75rem] bg-[#f3f5f8] px-3 py-6 ring-1 ring-[#0f1a2e]/6">
        <h2 className="px-1 text-center text-[17px] font-bold leading-snug tracking-tight text-[#0f1a2e]">
          {ESIM_HUB.whyTitleBefore}
          <span className="text-[#c9a244]">{ESIM_HUB.whyTitleAccentEsim}</span>
          {ESIM_HUB.whyTitleMid}
          <span className="text-[#c9a244]">{ESIM_HUB.whyTitleAccentBrand}</span>
          {ESIM_HUB.whyTitleAfter}
        </h2>

        <ul className="overflow-hidden rounded-[1.5rem] bg-white shadow-[0_8px_28px_rgba(15,26,46,0.06)] ring-1 ring-[#0f1a2e]/8">
          {ESIM_HUB.whyItems.map((item, index) => {
            const Icon = WHY_ICONS[item.id];
            return (
              <li
                key={item.id}
                className={
                  index === 0
                    ? 'flex items-center gap-3.5 px-4 py-4'
                    : 'flex items-center gap-3.5 border-t border-[#0f1a2e]/8 px-4 py-4'
                }
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0f1a2e]/[0.05] text-[#0f1a2e]">
                  <Icon size={22} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-medium text-muted">{item.eyebrow}</p>
                  <p className="mt-0.5 text-[15px] font-bold text-[#0f1a2e]">{item.title}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <p className="px-2 text-center text-[11px] font-medium leading-relaxed text-muted">
          {ESIM_HUB.whyFootnote}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="px-0.5 text-[15px] font-bold text-[#0f1a2e]">{ESIM_HUB.stepsTitle}</h2>
        <ol className="space-y-2.5">
          {ESIM_HUB.steps.map((step) => (
            <li
              key={step.id}
              className="flex gap-3 rounded-2xl bg-neutral-50 px-3.5 py-3.5 ring-1 ring-[#0f1a2e]/8"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0f1a2e] text-[11px] font-bold text-white">
                {step.id}
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-[#0f1a2e]">{step.title}</p>
                <p className="mt-0.5 text-[12px] font-medium leading-relaxed text-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <p className="px-0.5 text-[11px] font-medium leading-relaxed text-muted">{ESIM_HUB.footerNote}</p>

      <ul className="space-y-1.5 px-0.5 pb-1 text-xs font-semibold text-[#0f1a2e]">
        <li>
          <a href="/guides/esim-beginner/" className="underline-offset-2 hover:underline">
            해외여행 이심(eSIM), 처음이면 뭐부터?
          </a>
        </li>
        <li>
          <a href="/faq/" className="underline-offset-2 hover:underline">
            자주 묻는 질문
          </a>
        </li>
      </ul>
    </div>
  );
}

import { BRAND_SUBLINE, BRAND_TAGLINE } from '../constants/marketing';

export default function HomeHero() {
  return (
    <section className="shadow-card rounded-3xl bg-sky-soft px-5 py-5 ring-1 ring-sky-border/45">
      <span className="inline-flex items-center rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-semibold text-brand">
        발렛 주차, 맡긴 뒤에도 보이는 서비스
      </span>

      <h2 className="mt-3.5 text-[1.375rem] font-bold leading-[1.35] tracking-tight text-ink">
        {BRAND_TAGLINE}
      </h2>

      <p className="mt-2.5 text-[13px] leading-[1.6] text-muted">{BRAND_SUBLINE}</p>
    </section>
  );
}

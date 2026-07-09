import {
  HOME_COMPARE_CHIPS,
  HOME_HEADLINE,
  HOME_SUBLINE,
} from '../constants/marketing';
import { buildHomeTrustStats } from '../lib/homeStats';
import type { Company } from '../types';

export default function HomeHero({ companies }: { companies: Company[] }) {
  const trustStats = buildHomeTrustStats(companies);

  return (
    <section className="space-y-5 px-0.5 pb-1 pt-1">
      <div className="space-y-2.5">
        <h1 className="text-[1.875rem] font-bold leading-[1.18] tracking-tight text-ink">
          {HOME_HEADLINE}
        </h1>
        <p className="max-w-[22rem] text-[15px] font-medium leading-relaxed text-muted">
          {HOME_SUBLINE}
        </p>
        <ul className="flex flex-wrap gap-1.5 pt-0.5">
          {HOME_COMPARE_CHIPS.map((chip) => (
            <li
              key={chip}
              className="rounded-lg bg-sky-tint px-2.5 py-1 text-[11px] font-bold text-brand ring-1 ring-sky-border/70"
            >
              {chip}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-3xl bg-white/85 p-5 ring-1 ring-sky-border/60 shadow-card">
        <dl className="grid grid-cols-3 gap-2 divide-x divide-sky-border/50">
          {trustStats.map(({ value, label, hint }) => (
            <div key={label} className="px-1 text-center first:pl-0 last:pr-0">
              <dt className="text-[1.375rem] font-bold tabular-nums tracking-tight text-brand">
                {value}
              </dt>
              <dd className="mt-0.5 text-[11px] font-bold leading-snug text-ink">{label}</dd>
              <dd className="mt-0.5 text-[10px] font-medium leading-snug text-muted">{hint}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

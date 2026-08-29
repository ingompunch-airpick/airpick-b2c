import { Camera, MapPin, ShieldCheck } from 'lucide-react';
import { HOME_TRUST_CRITERIA } from '../../constants/marketing';

const ICONS = {
  insurance: ShieldCheck,
  location: MapPin,
  photos: Camera,
} as const;

/** 홈 본론 — 카드 남발 없이 한 덩어리로 */
export default function HomeTrustCriteria() {
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-[#0f1a2e]/10 pb-3 md:pb-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.14em] text-[#c9a962]">
            {HOME_TRUST_CRITERIA.eyebrow}
          </p>
          <h2 className="mt-1 text-[1.2rem] font-bold leading-snug tracking-tight text-[#0f1a2e] md:text-[1.4rem]">
            {HOME_TRUST_CRITERIA.title}
          </h2>
        </div>
        <a
          href={HOME_TRUST_CRITERIA.criteriaHref}
          className="text-[12px] font-bold text-[#0f1a2e]/45 underline-offset-2 hover:text-[#0f1a2e] hover:underline"
        >
          {HOME_TRUST_CRITERIA.criteriaCta}
        </a>
      </div>

      <ul className="divide-y divide-[#0f1a2e]/8">
        {HOME_TRUST_CRITERIA.items.map((item) => {
          const Icon = ICONS[item.id as keyof typeof ICONS] ?? ShieldCheck;
          return (
            <li key={item.id} className="flex gap-3.5 py-4 first:pt-4 last:pb-0 md:gap-4 md:py-5">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0f1a2e] text-[#c9a962]">
                <Icon size={17} strokeWidth={2.25} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[14px] font-bold text-[#0f1a2e]">{item.title}</p>
                <p className="mt-1 text-[12px] font-medium leading-relaxed text-[#0f1a2e]/50 md:text-[13px]">
                  {item.body}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

import { Camera, MapPin, ShieldCheck } from 'lucide-react';
import { PARTNER_PROMISE, TRUST_PILLARS } from '../constants/marketing';

const icons = {
  location: MapPin,
  photos: Camera,
  insurance: ShieldCheck,
} as const;

export default function TrustPromise() {
  return (
    <section>
      <p className="mb-1 px-0.5 text-xs font-semibold text-brand">{PARTNER_PROMISE}</p>
      <p className="mb-2.5 px-0.5 text-xs font-semibold text-muted">맡긴 뒤에도 확인하는 3가지</p>
      <div className="space-y-2.5">
        {TRUST_PILLARS.map(({ id, title, desc }) => {
          const Icon = icons[id];
          return (
            <div
              key={id}
              className="shadow-card flex gap-3 rounded-2xl bg-sky-soft/90 px-3.5 py-3.5 ring-1 ring-sky-border/40"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10">
                <Icon size={18} className="text-brand" strokeWidth={2} />
              </div>
              <div className="min-w-0 pt-0.5">
                <p className="text-sm font-bold text-ink">{title}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-muted">{desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

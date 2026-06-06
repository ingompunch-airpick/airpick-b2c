import { MapPin, ShieldCheck, Star, Tag } from 'lucide-react';

const features = [
  { icon: Tag, title: '가격', desc: '날짜·터미널별 요금' },
  { icon: MapPin, title: '위치', desc: '터미널·주차장 거리' },
  { icon: Star, title: '평점', desc: '별점·고객 후기' },
  { icon: ShieldCheck, title: '보험', desc: '가입·보장 한도' },
] as const;

export default function ComparisonFeatures() {
  return (
    <section>
      <p className="mb-2.5 px-0.5 text-xs font-semibold text-muted">무엇을 비교하나요</p>
      <div className="grid grid-cols-2 gap-2.5">
        {features.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="shadow-card rounded-2xl bg-sky-soft/90 px-3.5 py-3.5 ring-1 ring-sky-border/40"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-bg">
              <Icon size={17} className="text-brand" strokeWidth={2} />
            </div>
            <p className="mt-2.5 text-sm font-bold text-ink">{title}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

import { ShieldCheck, Star } from 'lucide-react';
import type { ValetPartnerCard } from '../../repositories/homeMapRepository';
import { companyThumbnailUrl } from '../../utils/imageUrl';

export default function ValetPartnerList({
  items,
  onReserve,
}: {
  items: ValetPartnerCard[];
  onReserve: (companyId: string) => void;
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl bg-sky-soft px-4 py-8 text-center text-sm text-muted">
        입점 업체를 불러오는 중이거나, 조건에 맞는 업체가 없습니다.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex gap-3 rounded-2xl bg-sky-soft/80 p-3 ring-1 ring-sky-border/50"
        >
          <img
            src={companyThumbnailUrl(item.imageUrl, 96)}
            alt=""
            width={64}
            height={64}
            className="h-16 w-16 shrink-0 rounded-xl object-cover ring-2 ring-white"
            loading="lazy"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="truncate text-sm font-bold text-ink">{item.name}</p>
              <p className="shrink-0 text-sm font-bold tabular-nums text-brand">
                {item.price.toLocaleString()}원~
              </p>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-muted">
              {item.rating != null && item.reviewCount > 0 ? (
                <span className="inline-flex items-center gap-0.5">
                  <Star size={11} className="fill-amber-400 text-amber-400" />
                  {item.rating.toFixed(1)} · 후기 {item.reviewCount}
                </span>
              ) : (
                <span>실후기 누적 중</span>
              )}
              <span className="inline-flex items-center gap-0.5">
                <ShieldCheck size={11} className={item.insuranceEnrolled ? 'text-brand' : 'text-muted-light'} />
                {item.insuranceEnrolled ? '보험 안내' : '보험 미확인'}
              </span>
              <span>{item.sharesPhotos ? '입고 사진 제공' : '사진 미제공'}</span>
            </div>
            <button
              type="button"
              onClick={() => onReserve(item.id)}
              className="mt-2 w-full rounded-xl bg-brand py-2 text-xs font-bold text-white transition hover:bg-brand-dark"
            >
              예약하기
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

import type { EsimCountryCard } from '../../repositories/homeMapRepository';

export default function EsimCountryList({
  items,
  onOpen,
}: {
  items: EsimCountryCard[];
  onOpen: (countryCode: string) => void;
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl bg-sky-soft px-4 py-8 text-center text-sm text-muted">
        표시할 eSIM 상품이 없습니다.
      </p>
    );
  }

  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item.countryCode}>
          <button
            type="button"
            onClick={() => onOpen(item.countryCode)}
            className="flex w-full items-center justify-between gap-3 rounded-2xl bg-sky-soft/80 px-4 py-3.5 text-left ring-1 ring-sky-border/50 transition hover:bg-sky-tint"
          >
            <div>
              <p className="text-sm font-bold text-ink">{item.name} eSIM</p>
              <p className="mt-0.5 text-[11px] font-medium text-muted">
                {item.offerCount}개 요금 · 제휴 비교
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold tabular-nums text-brand">
                {item.fromPrice.toLocaleString()}원~
              </p>
              <p className="mt-0.5 text-[11px] font-bold text-muted">비교하기</p>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

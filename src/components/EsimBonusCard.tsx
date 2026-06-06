import { ArrowRight } from 'lucide-react';
import { getParkingDayCount } from '../utils/pricing';
import type { BookingSearch } from '../types';

export default function EsimBonusCard({
  search,
  onBookNow,
}: {
  search: BookingSearch;
  onBookNow: () => void;
}) {
  const days = getParkingDayCount(search.departureDate, search.arrivalDate);

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5a9ff8] to-[#3182f6] px-5 pb-5 pt-5 shadow-card-strong">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl"
      />

      <div className="relative space-y-3.5">
        <h2 className="text-outline-navy text-[1.3125rem] font-bold leading-[1.45] tracking-tight text-white">
          주차 일수만큼 eSIM을
          <br />
          무료로 드립니다!
        </h2>

        <div className="rounded-2xl bg-white/12 px-4 py-4 ring-1 ring-white/15 backdrop-blur-sm">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-2">
            <div className="text-left">
              <p className="text-[11px] font-semibold text-white/85">주차</p>
              <p className="mt-0.5 text-[1.875rem] font-bold leading-none tabular-nums text-white">
                {days}일
              </p>
            </div>

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
              <ArrowRight size={14} className="text-white" strokeWidth={2.5} />
            </div>

            <div className="text-right">
              <p className="text-[11px] font-semibold leading-snug text-white/85">
                eSIM · 무제한
              </p>
              <p className="mt-0.5 text-[1.875rem] font-bold leading-none tabular-nums text-white">
                {days}일
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onBookNow}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-[15px] font-bold text-brand shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all active:scale-[0.99]"
        >
          지금 예약하기
          <ArrowRight size={17} strokeWidth={2.5} />
        </button>
      </div>
    </section>
  );
}

import { MapPin, Search } from 'lucide-react';
import DateField from './DateField';
import TimeField from './TimeField';
import type { BookingSearch, Terminal } from '../types';
import { cn } from '../utils/cn';
import { todayYmd } from '../utils/dates';
import { getParkingDayCount } from '../utils/pricing';
import { parkingTypeLabel } from '../utils/parkingType';

export default function SearchPanel({
  search,
  onChange,
  onSubmit,
  compact = false,
}: {
  search: BookingSearch;
  onChange: (next: BookingSearch) => void;
  onSubmit: () => void;
  compact?: boolean;
}) {
  const days = getParkingDayCount(search.departureDate, search.arrivalDate);
  const today = todayYmd();

  return (
    <div
      className={cn(
        'rounded-2xl bg-sky-soft shadow-[0_2px_12px_rgba(49,130,246,0.08)]',
        compact ? 'p-3' : 'p-4'
      )}
    >
      <div className="mb-3 flex items-center gap-2 rounded-xl bg-sky-tint px-3 py-2.5">
        <Search size={18} className="shrink-0 text-brand" />
        <span className="text-sm font-bold text-ink">언제 주차하시나요?</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <DateField
          label="입고(출국)"
          value={search.departureDate}
          min={today}
          onChange={(departureDate) => {
            const next = { ...search, departureDate };
            if (next.arrivalDate < departureDate) {
              next.arrivalDate = departureDate;
            }
            onChange(next);
          }}
        />
        <DateField
          label="출고(입국)"
          value={search.arrivalDate}
          min={search.departureDate}
          onChange={(arrivalDate) => onChange({ ...search, arrivalDate })}
        />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <TimeField
          label="입고 시간"
          value={search.departureTime}
          onChange={(departureTime) => onChange({ ...search, departureTime })}
        />
        <TimeField
          label="출고 시간"
          value={search.arrivalTime}
          onChange={(arrivalTime) => onChange({ ...search, arrivalTime })}
        />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        {(['T1', 'T2'] as Terminal[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              const next = { ...search, terminal: t };
              if (!search.arrivalTerminal || search.arrivalTerminal === search.terminal) {
                next.arrivalTerminal = t;
              }
              onChange(next);
            }}
            className={cn(
              'rounded-xl py-2 text-xs font-bold transition-colors',
              search.terminal === t
                ? 'bg-sky-deep text-brand'
                : 'bg-sky-bg text-muted'
            )}
          >
            {t === 'T1' ? '1터미널' : '2터미널'}
          </button>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange({ ...search, isIndoor: true })}
          className={cn(
            'rounded-xl py-2 text-xs font-bold transition-colors',
            search.isIndoor ? 'bg-sky-deep text-brand' : 'bg-sky-bg text-muted'
          )}
        >
          실내
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...search, isIndoor: false })}
          className={cn(
            'rounded-xl py-2 text-xs font-bold transition-colors',
            !search.isIndoor ? 'bg-sky-deep text-brand' : 'bg-sky-bg text-muted'
          )}
        >
          야외
        </button>
      </div>

      <p className="mt-2 text-center text-[11px] font-semibold text-muted">
        총 <span className="font-bold text-brand">{days}일</span> · {search.departureTime} →{' '}
        {search.arrivalTime} · {search.terminal} ·{' '}
        {search.isIndoor ? parkingTypeLabel(true) : parkingTypeLabel(false)}
      </p>
      <p className="mt-1 text-center text-[10px] font-medium text-muted-light">
        입·출차 시간 기준 야간 할증 포함
      </p>

      {!compact && (
        <button
          type="button"
          onClick={onSubmit}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark active:scale-[0.98]"
        >
          <MapPin size={16} />
          업체 가격 비교하기
        </button>
      )}
    </div>
  );
}

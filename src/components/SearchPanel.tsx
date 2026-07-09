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
  compact = false,
}: {
  search: BookingSearch;
  onChange: (next: BookingSearch) => void;
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

      <button
        type="button"
        onClick={() => onChange({ ...search, faceToFace: !search.faceToFace })}
        className={cn(
          'mt-2 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors',
          search.faceToFace ? 'bg-sky-deep' : 'bg-sky-bg'
        )}
      >
        <span className="flex flex-col">
          <span
            className={cn('text-xs font-bold', search.faceToFace ? 'text-brand' : 'text-ink')}
          >
            대면 입고 희망
          </span>
          <span className="text-[10px] font-medium text-muted">
            출국장 앞에서 기사에게 직접 인계 (에어픽 입점 업체)
          </span>
        </span>
        <span
          className={cn(
            'relative h-5 w-9 shrink-0 rounded-full transition-colors',
            search.faceToFace ? 'bg-brand' : 'bg-muted-light'
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform',
              search.faceToFace ? 'translate-x-4' : 'translate-x-0.5'
            )}
          />
        </span>
      </button>

      <p className="mt-2 text-center text-[11px] font-semibold text-muted">
        총 <span className="font-bold text-brand">{days}일</span> · {search.departureTime} →{' '}
        {search.arrivalTime} · {search.terminal} ·{' '}
        {search.isIndoor ? parkingTypeLabel(true) : parkingTypeLabel(false)}
        {search.faceToFace ? ' · 대면' : ''}
      </p>
      <p className="mt-1 text-center text-[10px] font-medium text-muted-light">
        입·출차 시간 기준 야간 할증 포함
      </p>
    </div>
  );
}

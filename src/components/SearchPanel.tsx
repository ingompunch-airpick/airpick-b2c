import DateField from './DateField';
import TimeField from './TimeField';
import TerminalFields from './TerminalFields';
import type { BookingSearch, Terminal } from '../types';
import { cn } from '../utils/cn';
import { todayYmd } from '../utils/dates';
import { getParkingDayCount } from '../utils/pricing';
import { parkingTypeLabel } from '../utils/parkingType';
import { formatTerminalSummary } from '../utils/terminalLabels';

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
  const arrivalTerminal = search.arrivalTerminal ?? search.terminal;
  const differentArrivalTerminal =
    search.arrivalTerminal != null && search.arrivalTerminal !== search.terminal;

  const handleDepartureTerminal = (terminal: Terminal) => {
    const next = { ...search, terminal };
    if (!differentArrivalTerminal) {
      next.arrivalTerminal = terminal;
    }
    onChange(next);
  };

  const handleDifferentArrival = (different: boolean) => {
    if (!different) {
      onChange({ ...search, arrivalTerminal: search.terminal });
      return;
    }
    const other: Terminal = search.terminal === 'T1' ? 'T2' : 'T1';
    onChange({ ...search, arrivalTerminal: other });
  };

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

      <div className="mt-2">
        <TerminalFields
          departure={search.terminal}
          arrival={arrivalTerminal}
          differentArrival={differentArrivalTerminal}
          onDepartureChange={handleDepartureTerminal}
          onDifferentArrivalChange={handleDifferentArrival}
          onArrivalChange={(arrivalTerminal) => onChange({ ...search, arrivalTerminal })}
        />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
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
      </div>

      <p className="mt-2 text-center text-[11px] font-semibold text-muted">
        총 <span className="font-bold text-brand">{days}일</span> · {search.departureTime} →{' '}
        {search.arrivalTime} · {formatTerminalSummary(search.terminal, arrivalTerminal)} ·{' '}
        {search.isIndoor ? parkingTypeLabel(true) : parkingTypeLabel(false)}
      </p>
      <p className="mt-1 text-center text-[10px] font-medium text-muted-light">
        입·출차 시간 기준 야간 할증 포함
      </p>
    </div>
  );
}
